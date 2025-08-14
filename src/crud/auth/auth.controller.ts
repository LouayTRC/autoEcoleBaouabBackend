import { Body, Controller, Get, Post } from '@nestjs/common';
import { ServiceResponse } from 'src/common/types';
import { UserService } from 'src/crud/user/user.service';
import { AuthService } from './auth.service';
import { User } from 'src/crud/user/user.schema';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { loginSchema, registerSchema } from 'src/validation/requests/auth.validators';

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService){}

    @Post("register")
    async register(@Body(new JoiValidationPipe(registerSchema)) form:any):Promise<ServiceResponse<User | null>>{
        return await this.authService.register(form)
    }


    @Post("login")
    async login(@Body(new JoiValidationPipe(loginSchema)) form:any):Promise<ServiceResponse<any | null>>{
        return await this.authService.login(form)
    }


    
}
