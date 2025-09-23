import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.schema';
import { ServiceResponse } from 'src/common/types';
import { UserService } from 'src/crud/user/user.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { send } from 'process';
import { EmailService } from '../email/email.service';
import { createForgetPwdEmail,createResetPasswordSuccessEmail } from 'src/common/emails';
import { randomBytes } from 'crypto';

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


    generateJwt(user: any) {
        return this.jwtService.sign({
            user_id: user.id,
            user_role: user.role,
        });
    }

    async forgetPassword(identifiant: string): Promise<ServiceResponse<null>> {

        const getUser = await this.userService.getUserByIdentifiant(identifiant);
        if (!getUser.data) {
            throw new NotFoundException("Utilisateur introuvable !");
        }

        const token = randomBytes(32).toString('hex');
        const hashSalt=process.env.HASH_SALT
       
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


    async resetPwd(form:any):Promise<ServiceResponse<null>>{

        const {token, password,identifiant}=form;

        const getUser=await this.userService.getUserByIdentifiant(identifiant);
        if (!getUser.data) {
            throw new NotFoundException("Utilisateur introuvable !");
        }

        if (!getUser.data.resetToken || !getUser.data.resetTokenExpiration) {
            throw new ForbiddenException("Cette action est impossible !")
        }

        if (new Date(getUser.data.resetTokenExpiration)<new Date()) {
            throw new BadRequestException("Ce token est invalide !")
        }

        const verifToken=await bcrypt.compare(token,getUser.data.resetToken!);
        if (!verifToken) {
            throw new BadRequestException("Ce token n'est pas valide !")
        }


        await this.userService.updateUser(getUser.data.id,{password,resetToken:null,resetTokenExpiration:null});

        const emailPayload=createResetPasswordSuccessEmail(getUser.data.email)
        await this.emailService.sendMail(emailPayload.subject,emailPayload.html,undefined,emailPayload.to)

        return{
            data:null,
            message:"Mot de passe réinitilisé avec succès !"
        }
    }
}
