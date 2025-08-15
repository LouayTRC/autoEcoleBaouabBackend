import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { RoleService } from 'src/crud/role/role.service';
import { ServiceResponse } from 'src/common/types';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';


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


                const role = await this.roleService.getRoleByName(adminRole)
                if (!role) {
                    console.log("Role admin introuvable");
                    return
                }


                const password = await bcrypt.hash(infos.password, Number(hashSalt))


                await this.userModel.create({
                    firstName: infos.firstName,
                    lastName: infos.lastName,
                    username: infos.username,
                    email: infos.email,
                    cin: infos.cin,
                    password,
                    role
                })

                console.log("Admin initialisé avec success !!");
                return
            }

            console.log("Admin already exists");

        }
    }


    async create(form: any, role: string): Promise<ServiceResponse<User>> {

        const { firstName, lastName, username, email, password, cin } = form

        const unique = await this.verifUniqueCredentials(form);
        if (!unique) {
            throw new ConflictException("Identifiant déja utilisé")
        }

        const getRole = await this.roleService.getRoleByName(role);
        if (!getRole.data) {
            throw new NotFoundException("Ce role n'existe pas !")
        }

        try {
            const hashedPwd = await bcrypt.hash(password, Number(this.configService.get("HASH_SALT")))

            const newUser = await this.userModel.create({
                firstName,
                lastName,
                username,
                email,
                role: getRole,
                password: hashedPwd,
                cin
            })

            return {
                message: "Utilisateur créé avec succès",
                data: newUser,
            }

        } catch (error) {
            throw new InternalServerErrorException("Problème dans la création de votre compte !")
        }
    }

    async getAllUsers(): Promise<ServiceResponse<User[]>> {
        return this.userModel.find().exec()
            .then(users => ({
                data: users || [],
            }))
            .catch(error => {
                throw new InternalServerErrorException("Problème dans la récupération des utilisateurs !")
            });
    }


    async getUserByIdentifiant(identifiant: string): Promise<ServiceResponse<UserDocument | null>> {
        const user = await this.userModel.findOne({
            $or: [
                { username: identifiant },
                { email: identifiant },
            ]
        }).populate('role').exec()

        return {
            data: user
        };
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
