import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.schema';
import { ServiceResponse } from 'src/common/types';
import { UserService } from 'src/crud/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { createForgetPwdEmail, createResetPasswordSuccessEmail } from 'src/common/emails';
import bcrypt from 'node_modules/bcryptjs';
import { randomBytes } from 'crypto';
import { Request, Response } from "express";

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private configService: ConfigService,
        private jwtService: JwtService,
        private emailService: EmailService
    ) { }


    async register(form: any): Promise<ServiceResponse<User | null>> {
        const role = this.configService.get("CLIENT_ROLE");
        return await this.userService.createLocalUser(form, role)
    }

    async addAdmin(form: any): Promise<ServiceResponse<User | null>> {
        const role = this.configService.get("ADMIN_ROLE");
        return await this.userService.createLocalUser(form, role)
    }


    async validateUser(identifiant: string, pwd: string) {
        const getUser = await this.userService.getUserByIdentifiant(identifiant);
        if (!getUser.data) {
            return null;
        }


        if (getUser.data.password) {
            const verifPassword = await bcrypt.compare(pwd, getUser.data.password);
            if (!verifPassword) {
                return null;
            }
        }
        else {
            return null
        }

        return (await this.userService.getUserById(getUser.data.id)).data;
    }

    async logout(req: Request, res: Response) {
        const currentRefreshToken = req.cookies['refreshToken'];
        if (!currentRefreshToken) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return { message: 'Déconnecté avec succès' };
        }

        try {
            const payload: any = this.jwtService.verify(currentRefreshToken, {
                secret: this.configService.get("REFRESH_JWT_SECRET"),
            });

            const { user_id, jti } = payload;

            const user = await this.userService.getUserById(user_id);

            if (user.data) {

                const now = new Date();
                user.data.refreshTokens = user.data.refreshTokens.filter(rt => rt.expiresAt > now);

                // on filtre en DB directement sur le jti
                const updatedTokens = user.data!.refreshTokens.filter(rt => rt.jti !== jti);

                await this.userService.updateUser(user_id, { refreshTokens: updatedTokens });
            }


        } catch (e) {
            
        } finally {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return { message: 'Déconnecté avec succès' };
        }
    }


    generateTokens(user: any) {
        const accessToken = this.jwtService.sign({
            user_id: user.id,
            user_role: user.role,
        }, {
            secret: this.configService.get<string>('ACCESS_JWT_SECRET'),
            expiresIn: this.configService.get<string>('ACCESS_JWT_EXPIRES_IN') || '1h',
        });

        const jti = randomBytes(16).toString("hex"); // identifiant unique
        const refreshToken = this.jwtService.sign({
            user_id: user.id,
            jti,
        }, {
            secret: this.configService.get("REFRESH_JWT_SECRET"),
            expiresIn: this.configService.get("REFRESH_JWT_EXPIRES_IN") || "7d",
        });

        return { accessToken, refreshToken, jti };
    }


    async refreshTokens(refresh_token: string) {
        try {
            const payload: any = this.jwtService.verify(refresh_token, {
                secret: this.configService.get("REFRESH_JWT_SECRET"),
            });

            const user = await this.userService.getUserById(payload.user_id);
            if (!user.data) throw new UnauthorizedException('Utilisateur introuvable');

            // 🧹 Nettoyer les tokens expirés
            const now = new Date();
            user.data.refreshTokens = (user.data.refreshTokens || []).filter(rt => rt.expiresAt > now);

            // Trouver l’entrée par jti
            const tokenEntry = user.data.refreshTokens.find(rt => rt.jti === payload.jti);
            if (!tokenEntry) throw new UnauthorizedException("Refresh token invalide ou expiré !");

            // Vérifier que le hash correspond
            const isValid = await bcrypt.compare(refresh_token, tokenEntry.tokenHash);
            if (!isValid) throw new UnauthorizedException("Refresh token compromis !");

            // Générer nouveaux tokens
            const { accessToken, refreshToken, jti } = this.generateTokens(user.data);

            // Rotation : remplacer par le nouveau
            const newHash = await bcrypt.hash(refreshToken, Number(process.env.HASH_SALT!));
            tokenEntry.jti = jti;
            tokenEntry.tokenHash = newHash;
            tokenEntry.createdAt = new Date();
            tokenEntry.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // Sauvegarde user
            await this.userService.updateUser(user.data._id.toString(), { refreshTokens: user.data.refreshTokens });

            return { accessToken, refreshToken };
        } catch (error) {
            throw new UnauthorizedException("Refresh token invalide ou expiré !");
        }
    }






    async forgetPassword(identifiant: string): Promise<ServiceResponse<null>> {

        const getUser = await this.userService.getUserByIdentifiant(identifiant);
        if (!getUser.data) {
            throw new NotFoundException("Utilisateur introuvable !");
        }

        const token = randomBytes(32).toString('hex');
        const hashSalt = process.env.HASH_SALT

        // Hash du token pour la DB
        const hashedToken = await bcrypt.hash(token, Number(hashSalt!))
        const expiration = new Date(Date.now() + 60 * 60 * 1000);

        await this.userService.updateUser(getUser.data.id, { resetToken: hashedToken, resetTokenExpiration: expiration });

        const forgetEmail = createForgetPwdEmail(getUser.data.email, token)

        await this.emailService.sendMail(forgetEmail.subject, forgetEmail.html, undefined, forgetEmail.to)

        return {
            data: null,
            message: "Email envoyé avec succès"
        }
    }


    async resetPwd(form: any): Promise<ServiceResponse<null>> {

        const { token, password, identifiant } = form;

        const getUser = await this.userService.getUserByIdentifiant(identifiant);
        if (!getUser.data) {
            throw new NotFoundException("Utilisateur introuvable !");
        }

        if (!getUser.data.resetToken || !getUser.data.resetTokenExpiration) {
            throw new ForbiddenException("Cette action est impossible !")
        }

        if (new Date(getUser.data.resetTokenExpiration) < new Date()) {
            throw new BadRequestException("Ce token est invalide !")
        }

        const verifToken = await bcrypt.compare(token, getUser.data.resetToken!);
        if (!verifToken) {
            throw new BadRequestException("Ce token n'est pas valide !")
        }


        await this.userService.updateUser(getUser.data.id, { password, resetToken: null, resetTokenExpiration: null });

        const emailPayload = createResetPasswordSuccessEmail(getUser.data.email)
        await this.emailService.sendMail(emailPayload.subject, emailPayload.html, undefined, emailPayload.to)

        return {
            data: null,
            message: "Mot de passe réinitilisé avec succès !"
        }
    }


    async getConnectedUser(req: Request): Promise<ServiceResponse<User | null>> {
        const token = await req.cookies?.accessToken;

        if (!token) {
            return {
                data: null
            }
        }


        try {
            const decoded = await this.jwtService.decode(token);

            if (!decoded || !decoded.user_id) {
                return {
                    data: null
                }
            }

            const getUser = await this.userService.getUserById(decoded.user_id);
            if (!getUser.data) {
                return {
                    data: null
                }
            }

            return {
                data: getUser.data
            }
        } catch (error) {
            return {
                data: null
            }
        }
    }
}
