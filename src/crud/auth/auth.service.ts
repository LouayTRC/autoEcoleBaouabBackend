import { Injectable } from '@nestjs/common';
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
        private jwtService:JwtService
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
        try {
            const { username, password } = form

            const getUser = await this.userService.getUserByIdentifiant(username);
            if (!getUser.success || !getUser.data) {
                return { ...getUser }
            }

            const verifPassword = await bcrypt.compare(password,getUser.data.password)
            if (!verifPassword) {
                return {
                    success:false,
                    message: "Login/Mdp incorrect",
                    data:null,
                    errorCode:400
                }
            }

            const token=this.jwtService.sign(
                {
                    user_id:getUser.data._id,
                    user_role:getUser.data.role._id
                })

            return {
                success:true,
                data:{
                    user:getUser.data,
                    token
                },
                message:"Login avec succès"
            }
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message || "Problème dans la connexion !",
                errorCode: 500
            }
        }
    }


}
