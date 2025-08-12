import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { RoleService } from 'src/role/role.service';
import { ServiceResponse } from 'src/common/types';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private configService: ConfigService,
        private roleService: RoleService,
    ) { }


    async create(form: any, role: string): Promise<ServiceResponse<User | null>> {
        try {
            const { firstName, lastName, username, email, password } = form

            const unique = await this.verifUniqueCredentials(form);
            if (!unique) {
                return { success: false, data: null, message: "", errorCode: 409 }
            }

            const getRole = await this.roleService.getRoleByName(role);
            if (!getRole.success || !getRole.data) {
                return { success: false, data: null, message: getRole.message, errorCode: getRole.errorCode }
            }

            const hashedPwd = await bcrypt.hash(password, Number(this.configService.get("HASH_SALT")))

            const newUser = await this.userModel.create({
                firstName,
                lastName,
                username,
                email,
                role: getRole.data,
                password: hashedPwd
            })

            return {
                success: true,
                message: "Utilisateur créé avec succès",
                data: newUser,
            }

        } catch (error) {
            return {
                success: false,
                message: error.message || "Problème dans la création de votre compte !",
                data: null,
                errorCode: 500
            }
        }



    }


    async getUserByCredentials(identifiant: string, relations?: string[]): Promise<ServiceResponse<UserDocument | null>> {
        try {
            let query = this.userModel.findOne({
                $or: [
                    { username: identifiant },
                    { email: identifiant },
                ]
            })

            if (relations && relations.length > 0) {
                query = query.populate(relations.map(path => ({ path })));
            }

            const user = await query.exec();

            if (!user) {
                return {
                    success: false,
                    message: "Username / Email introuvable !!",
                    errorCode: 404,
                    data: null
                };
            }

            return {
                success: false,
                data: user
            };

        } catch (error) {
            return {
                success: false,
                message: "Problème dans la connexion !",
                errorCode: 500,
                data: null
            };
        }
    }



    async verifUniqueCredentials(form: any): Promise<boolean> {
        try {
            const user = await this.userModel.findOne({
                $or: [
                    { username: form.username },
                    { email: form.email },
                    { cin: form.cin }
                ]
            }).exec();
            return !user;
        } catch (error) {
            return false;
        }
    }

}
