import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Put, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ServiceResponse } from 'src/common/types';
import { UserService } from 'src/crud/user/user.service';
import { AuthService } from './auth.service';
import { User } from 'src/crud/user/user.schema';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { loginSchema, registerSchema } from 'src/validation/requests/auth.validators';
import type { Response } from 'express';
import { LocalStrategy } from 'src/strategies/local.strategy';
import { LocalAuthGuard } from 'src/guards/local.auth.guard';
import { GoogleAuthGuard } from 'src/guards/google.auth.guard';
import { FacebookAuthGuard } from 'src/guards/facebook.auth.guard';
import { AuthenticateMiddleware } from 'src/middlewares/authenticate.middleware';
import { AuthenticateGuard } from 'src/guards/authenticate.guard';
import bcrypt from 'node_modules/bcryptjs';
import { UAParser } from 'ua-parser-js';
import { JwtService } from '@nestjs/jwt';



@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private userService: UserService, private jwtService: JwtService) { }

    @Post("signup")
    async register(@Body(new JoiValidationPipe(registerSchema)) form: any): Promise<ServiceResponse<User | null>> {
        return await this.authService.register(form)
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Req() req, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, jti } = this.authService.generateTokens(req.user);

        const userAgent = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgent);
        const device = parser.getDevice().model || parser.getBrowser().name || 'Unknown';


        const tokenHash = await bcrypt.hash(refreshToken, Number(process.env.HASH_SALT!));

        
        await this.userService.addRefreshToken(req.user.id, {
            jti,
            tokenHash,
            device,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        });

        // 4️⃣ Envoyer les cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000, // 1h
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7j
            path: '/',
        });

        return { data: req.user, message: 'Login avec succès !' };
    }


    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {

        return await this.authService.logout(req, res)
    }


    @Get("google")
    @UseGuards(GoogleAuthGuard)
    async googleLogin() { }


    @Get("facebook")
    @UseGuards(FacebookAuthGuard)
    async facebookLogin() { }


    @Get("facebook/callback")
    @UseGuards(FacebookAuthGuard)
    async facebookCallback(@Req() req, @Res() res) {
        const facebookUserResponse = req.user

        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const username = (facebookUserResponse.name.givenName + facebookUserResponse.name.familyName + randomSuffix).toLowerCase();

        const user = {
            provider_id: facebookUserResponse.id,
            provider: 'facebook',
            provider_status: true,
            email: facebookUserResponse.emails[0].value,
            fullname: facebookUserResponse.name.givenName + " " + facebookUserResponse.name.familyName,
            username,
        }

        const createdUser = await this.userService.createOrLinkOauthUser(user);

        const { accessToken, refreshToken,jti } = this.authService.generateTokens(createdUser.data);


        const userAgent = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgent);
        const device = parser.getDevice().model || parser.getBrowser().name || 'Unknown';

        // 2️⃣ Hasher le refresh token
        const tokenHash = await bcrypt.hash(refreshToken, 10);

        // 3️⃣ Ajouter dans le tableau refreshTokens
        await this.userService.addRefreshToken(createdUser.data.id, {
            jti,
            tokenHash,
            device,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000, // 1h
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7j
            path: '/',
        });

        return res.redirect(process.env.FRONTEND_API);

    }


    @Get("google/callback")
    @UseGuards(GoogleAuthGuard)
    async googleCallback(@Req() req, @Res() res) {
        const googleUserReponse = req.user

        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const username = (googleUserReponse.name.givenName + googleUserReponse.name.familyName + randomSuffix).toLowerCase();

        const user = {
            provider_id: googleUserReponse.id,
            provider: 'google',
            provider_status: googleUserReponse.emails[0].verified,
            email: googleUserReponse.emails[0].value,
            fullname: googleUserReponse.name.givenName + " " + googleUserReponse.name.familyName,
            username,
        }

        const createdUser = await this.userService.createOrLinkOauthUser(user);

        const { accessToken, refreshToken, jti } = this.authService.generateTokens(createdUser.data);


        const userAgent = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgent);
        const device = parser.getDevice().model || parser.getBrowser().name || 'Unknown';

        // 2️⃣ Hasher le refresh token
        const tokenHash = await bcrypt.hash(refreshToken, 10);

        // 3️⃣ Ajouter dans le tableau refreshTokens
        await this.userService.addRefreshToken(createdUser.data.id, {
            jti,
            tokenHash,
            device,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        });


        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000, // 1h
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7j
            path: '/',
        });

        return res.redirect(process.env.FRONTEND_API);

    }



    @Get("me")
    async getConnectedUser(@Req() req): Promise<ServiceResponse<User | null>> {
        return await this.authService.getConnectedUser(req);
    }



    @Get("forget/:identifiant")
    async forgetPwd(@Param("identifiant") identifiant: string): Promise<ServiceResponse<null>> {
        return await this.authService.forgetPassword(identifiant)
    }


    @Put("reset")
    async resetPwd(@Body() form: any): Promise<ServiceResponse<any>> {
        const getUser = await this.userService.getUserByIdentifiant(form.identifiant);
        if (!getUser.data) {
            throw new NotFoundException("Utilisateur introuvable !")
        }

        const res = await this.authService.resetPwd(form);
        await this.userService.updateUser(getUser.data.id, { refreshTokens: [] });
        return res
    }


    @Post("/refresh")
    async refreshToken(@Req() req, @Res() res): Promise<any> {

        const payload = req.cookies['refreshToken'];

        if (!payload) {
            throw new ForbiddenException("Token introuvable !");
        }

        const { accessToken, refreshToken } = await this.authService.refreshTokens(payload);

        // Renvoi nouveaux cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000, // 1h
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7j
            path: '/',
        });

        return res.json({ message: 'Tokens rafraîchis avec succès' });
    }
}
