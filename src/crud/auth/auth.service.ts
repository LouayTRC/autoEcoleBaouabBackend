import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.schema';
import { ServiceResponse } from 'src/common/types';
import { UserService } from 'src/crud/user/user.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private configService: ConfigService,
        private jwtService: JwtService
    ) { }


    async register(form: any): Promise<ServiceResponse<User | null>> {
        const role = this.configService.get("USER_ROLE");
        return await this.userService.create(form, role)
    }

    async addAdmin(form: any): Promise<ServiceResponse<User | null>> {
        const role = this.configService.get("ADMIN_ROLE");
        return await this.userService.create(form, role)
    }


    // async login(form: any): Promise<ServiceResponse<any | null>> {
    //     const { identifiant, password } = form

    //     const getUser = await this.userService.getUserByIdentifiant(identifiant);
    //     if (!getUser.data) {
    //         throw new NotFoundException("Username / Email introuvable !!")
    //     }

    //     const verifPassword = await bcrypt.compare(password, getUser.data.password)
    //     if (!verifPassword) {
    //         throw new UnauthorizedException("Login/Mdp incorrect !")
    //     }

    //     const token = this.jwtService.sign(
    //         {
    //             user_id: getUser.data.id,
    //             user_role: getUser.data.role.id
    //         })



    //     return {
    //         data: {
    //             user: getUser.data,
    //             token
    //         },
    //         message: "Login avec succès"
    //     }
    // }

    async validateUser(identifiant: string, pwd: string) {
        const getUser = await this.userService.getUserByIdentifiant(identifiant);
        if (!getUser.data) {
            return null;
        }

        const verifPassword = await bcrypt.compare(pwd, getUser.data.password);
        if (!verifPassword) {
            return null;
        }

        return (await this.userService.getUserById(getUser.data.id)).data;
    }


    generateJwt(user: any) {
        return this.jwtService.sign({
            user_id: user.id,
            user_role: user.role.id,
        });
    }
}
