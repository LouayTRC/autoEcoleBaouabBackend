import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.schema';
import { ServiceResponse } from 'src/common/types';
import { UserService } from 'src/crud/user/user.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';
import { JwtService } from '@nestjs/jwt';

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


    async login(form: any): Promise<ServiceResponse<any | null>> {
        const { username, password } = form

        const getUser = await this.userService.getUserByIdentifiant(username);

        const verifPassword = await bcrypt.compare(password, getUser.data.password)
        if (!verifPassword) {
            throw new UnauthorizedException("Login/Mdp incorrect !")
        }

        const token = this.jwtService.sign(
            {
                user_id: getUser.data._id,
                user_role: getUser.data.role._id
            })

        return {
            data: {
                user: getUser.data,
                token
            },
            message: "Login avec succès"
        }
    }


}
