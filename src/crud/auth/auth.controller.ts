import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private userService: UserService) { }

    @Post("signup")
    async register(@Body(new JoiValidationPipe(registerSchema)) form: any): Promise<ServiceResponse<User | null>> {
        return await this.authService.register(form)
    }

    @Post("login")
    @UseGuards(LocalAuthGuard)
    async login(@Req() req, @Res({ passthrough: true }) res: Response) {
        const token = this.authService.generateJwt(req.user);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,          // en prod: true (HTTPS)
            sameSite: 'lax',        // prod cross-site: 'none' + secure:true
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return {
            data: req.user,
            message: "Login avec succès !"
        }

    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: false,   // mettre true en prod si HTTPS
            sameSite: 'lax',
            path: '/'        // doit correspondre au path utilisé à la création
        });
        return { message: 'Déconnecté avec succès' };
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
        console.log("req", req.user);
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

        const token = this.authService.generateJwt(createdUser.data);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,          // en prod: true (HTTPS)
            sameSite: 'lax',        // prod cross-site: 'none' + secure:true
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        return res.redirect('http://localhost:4200');

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

        const token = this.authService.generateJwt(createdUser.data);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,          // en prod: true (HTTPS)
            sameSite: 'lax',        // prod cross-site: 'none' + secure:true
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
        });

        console.log("ici");


        return res.redirect('http://localhost:4200');

    }



    @Get("me")
    @UseGuards(AuthenticateGuard)
    async getConnectedUser(@Req() req): Promise<ServiceResponse<User | null>> {
        const user_id = req.user_id;
        const getUser = await this.userService.getUserById(user_id)

        return getUser
    }
}
