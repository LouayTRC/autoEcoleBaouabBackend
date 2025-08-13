import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { RoleService } from 'src/crud/role/role.service';
import { ServiceResponse } from 'src/common/types';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';
import { first } from 'rxjs';
import { info } from 'console';

@Injectable()
export class UserService implements OnModuleInit {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private configService: ConfigService,
        private roleService: RoleService,
    ) { }



    async onModuleInit() {
        const infos = {
            firstName: this.configService.get<string>("ADMIN_FIRST_NAME"),
            lastName: this.configService.get<string>("ADMIN_LAST_NAME"),
            username: this.configService.get<string>("ADMIN_USERNAME"),
            email: this.configService.get<string>("ADMIN_EMAIL"),
            cin: this.configService.get<string>("ADMIN_CIN"),
            password: this.configService.get<string>("ADMIN_PASSWORD")
        }

        if (!infos.firstName || !infos.lastName || !infos.username || !infos.email || !infos.cin || !infos.password) {
            console.log("Admin infos introuvables !!");
        }

        else {
            const existingAdmin = await this.getUserByIdentifiant(infos.username);
            if (!existingAdmin.data || !existingAdmin.data) {
                
                const hashSalt = this.configService.get<string>("HASH_SALT")
                const adminRole = this.configService.get<string>("ADMIN_ROLE")
                
                if (!hashSalt || !adminRole) {
                    console.log("parametres manquantes !!");
                    return
                }

                
                const getRole=await this.roleService.getRoleByName(adminRole)
                if (!getRole.success || !getRole.data) {
                    console.log("Role admin introuvable");
                    return
                }


                const password =await bcrypt.hash(infos.password, Number(hashSalt))


                await this.userModel.create({
                    firstName: infos.firstName,
                    lastName: infos.lastName,
                    username: infos.username,
                    email: infos.email,
                    cin: infos.cin,
                    password,
                    role:getRole.data
                })

                console.log("Admin initialisé avec success !!");
                

                return
            }

            console.log("Admin already exists");

        }
    }


    async create(form: any, role: string): Promise<ServiceResponse<User | null>> {
        try {
            const { firstName, lastName, username, email, password, cin } = form

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
                password: hashedPwd,
                cin
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

    async getAllUsers(): Promise<ServiceResponse<User[]>> {
        return this.userModel.find().exec()
            .then(users => ({
                success: true,
                data: users || [],
            }))
            .catch(error => ({
                success: false,
                message: error.message || "Problème dans la récupération des utilisateurs !",
                data: [],
                errorCode: 500
            }));
    }


    async getUserByIdentifiant(identifiant: string): Promise<ServiceResponse<UserDocument | null>> {
        try {
            const user = await this.userModel.findOne({
                $or: [
                    { username: identifiant },
                    { email: identifiant },
                ]
            }).populate('role').exec()



            if (!user) {
                return {
                    success: false,
                    message: "Username / Email introuvable !!",
                    errorCode: 404,
                    data: null
                };
            }

            return {
                success: true,
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
