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

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private userService: UserService) { }

    @Post("signup")
    async register(@Body(new JoiValidationPipe(registerSchema)) form: any): Promise<ServiceResponse<User | null>> {
        return await this.authService.register(form)
    }


    // @Post("login")
    // async login(@Bod-y(new JoiValidationPipe(loginSchema)) form: any, @Res({ passthrough: true }) res: Response): Promise<ServiceResponse<any | null>> {
    //     const result = await this.authService.login(form)

    //     if (result.data) {
    //         res.cookie("jwt", result.data.token, {
    //             httpOnly: true, // inaccessible par JS
    //             secure: false, // ! en HTTPS uniquement
    //             sameSite: "lax", // CSRF protection
    //             maxAge: 24 * 60 * 60 * 1000, // 1 jour
    //             path: '/'
    //         });


    //         // Prod 
    //         // res.cookie("jwt", token, {
    //         //     httpOnly: true,              // toujours pour sécurité
    //         //     secure: true,                // HTTPS obligatoire
    //         //     sameSite: "strict",          // protection CSRF maximale
    //         //     path: "/",                    // ou "/api" si tu veux limiter
    //         //     maxAge: 24 * 60 * 60 * 1000, // 1 jour
    //         //     domain: ".mon-domaine.com",   // si frontend et backend sur sous-domaines différents
    //         // });
    //     }

    //     const user = await this.userService.getUserById(result.data.user.id);

    //     return {
    //         data: user.data,
    //         message: result.message
    //     };
    // }

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



}
