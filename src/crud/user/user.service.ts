import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { RoleService } from 'src/crud/role/role.service';
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



    async onModuleInit() {
        const infos = {
            fullname: this.configService.get<string>("ADMIN_FULLNAME"),
            username: this.configService.get<string>("ADMIN_USERNAME"),
            email: this.configService.get<string>("ADMIN_EMAIL"),
            phone: this.configService.get<string>("ADMIN_PHONE"),
            password: this.configService.get<string>("ADMIN_PASSWORD")
        }

        if (!infos.fullname || !infos.phone || !infos.username || !infos.email || !infos.password) {
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
                if (!role.data) {
                    console.log("Role admin introuvable");
                    return
                }


                const password = await bcrypt.hash(infos.password, Number(hashSalt))


                await this.userModel.create({
                    fullname: infos.fullname,
                    username: infos.username,
                    email: infos.email,
                    phone: infos.phone,
                    password,
                    role: role.data._id
                })

                console.log("Admin initialisé avec success !!");
                return
            }

            console.log("Admin already exists");

        }
    }


    async create(form: any, role: string): Promise<ServiceResponse<User>> {

        const { fullname, username, email, password, phone } = form
   

        const verifUniqueErrors = await this.verifUniqueCredentials(form);
        if (verifUniqueErrors.length > 0) {      
            throw new ConflictException(verifUniqueErrors);
        }

        const getRole = await this.roleService.getRoleByName(role);
        if (!getRole.data) {
            throw new NotFoundException("Ce role n'existe pas !")
        }

        try {
            const hashedPwd = await bcrypt.hash(password, Number(this.configService.get("HASH_SALT")))

            const newUser = await this.userModel.create({
                fullname,
                username,
                email,
                phone,
                role: getRole.data._id,
                password: hashedPwd
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

    async getUserById(id: string): Promise<ServiceResponse<UserDocument | null>> {
        const user = await this.userModel.findOne({
            _id: id
        }).populate('role').exec();

        return {
            data: user
        };
    }

    async getUserByIdentifiant(identifiant: string): Promise<ServiceResponse<UserDocument | null>> {
        const user = await this.userModel.findOne({
            $or: [
                { username: identifiant },
                { email: identifiant },
            ]
        }).select('+password').populate('role').exec()

        return {
            data: user
        };
    }



    async verifUniqueCredentials(form: any): Promise<{ field: string; message: string }[]> {
        const errors: { field: string; message: string }[] = [];

        try {
            const user = await this.userModel.findOne({
                $or: [
                    { username: form.username },
                    { email: form.email }
                ]
            }).exec();

            if (!user) return errors;

            if (user.username === form.username) {
                errors.push({ field: 'username', message: 'Ce username est déjà utilisé' });
            }

            if (user.email === form.email) {
                errors.push({ field: 'email', message: "Cet email est déjà utilisé" });
            }

            return errors;

        } catch (error) {
            errors.push({ field: 'server', message: 'Erreur serveur, réessayez plus tard' });
            return errors;
        }
    }



}
