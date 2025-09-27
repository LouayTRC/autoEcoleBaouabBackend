import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { RoleService } from 'src/crud/role/role.service';
import { buildPopulateConfig, Roles, ServiceResponse } from 'src/common/types';
import { ClientSession, Model, Types } from 'mongoose';
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
                    role: role.data._id,
                    hasPassword: true
                })

                console.log("Admin initialisé avec success !!");
                return
            }

            console.log("Admin already exists");

        }
    }


    async createLocalUser(form: any, role: string): Promise<ServiceResponse<User>> {

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
                password: hashedPwd,
                hasPassword: true
            })

            return {
                message: "Utilisateur créé avec succès",
                data: newUser,
            }

        } catch (error) {
            throw new InternalServerErrorException("Problème dans la création de votre compte !")
        }
    }

    async createOrLinkOauthUser(form: any): Promise<ServiceResponse<UserDocument>> {

        const { provider, provider_id, provider_status, email, username, fullname } = form

        const role = process.env.CLIENT_ROLE;

        const getRole = await this.roleService.getRoleByName(role!);
        if (!getRole.data) {
            throw new NotFoundException("Ce role est introuvable !!")
        }


        const existingUser = await this.getUserByIdentifiant(email);
        if (existingUser.data) {
            const user = existingUser.data;
            const exists = user.linkedAccounts.some(acc => acc.provider === provider);
            if (!exists) {
                user.linkedAccounts.push({ provider, provider_id, verified: provider_status });
                await user.save();
            }
            return { message: "Utilisateur mis à jour avec succès", data: user };
        }


        const newUser = await this.userModel.create({
            username,
            email,
            fullname,
            role: getRole.data,
            linkedAccounts: [{ provider, provider_id, verified: provider_status }],
            password: null,
            phone: null,
            hasPassword: false
        });

        return {
            data: newUser,
            message: 'Compte créé avec succès !'
        }
    }

    async updateUser(user_id: string, userData: any, session?: ClientSession): Promise<ServiceResponse<User>> {

        const getUser = await this.getUserById(user_id, [], session);
        if (!getUser.data) {
            throw new NotFoundException("Cet utilisateur est introuvable !")
        }

        let payloadData: any = {}

        if (userData.username || userData.email) {
            const verifCredentials = await this.verifUniqueCredentials(userData, user_id);
            if (verifCredentials.length > 0) {
                throw new ConflictException(verifCredentials);
            }

            if (userData.email) {
                payloadData.email = userData.email;
            }

            if (userData.username) {
                payloadData.username = userData.username;
            }
        }

        if (userData.password) {
            const hashSalt = process.env.HASH_SALT
            const password = await bcrypt.hash(userData.password, Number(hashSalt))
            payloadData.password = password;
            payloadData.hasPassword = true
        }

        if (userData.fullname) {
            payloadData.fullname = userData.fullname;
        }

        if (userData.phone) {
            payloadData.phone = userData.phone;
        }

        payloadData.resetToken = userData.resetToken || null;
        payloadData.resetTokenExpiration = userData.resetTokenExpiration || null;

        // ✅ FIX: Gérer refreshTokens (pluriel) - pour remplacer le tableau complet
        if (userData.refreshTokens !== undefined) {
            payloadData.refreshTokens = userData.refreshTokens;
        }
        // Gérer refreshToken (singulier) - pour ajouter un nouveau token
        else if (userData.refreshToken) {
            const tokenHash = await bcrypt.hash(userData.refreshToken, Number(process.env.HASH_SALT || 10));

            payloadData.refreshTokens = [
                ...(getUser.data.refreshTokens || []),
                {
                    jti: userData.jti,
                    tokenHash,
                    device: userData.device || 'Unknown',
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            ];

            // Limiter à 5 tokens max
            if (payloadData.refreshTokens.length > 5) {
                payloadData.refreshTokens = payloadData.refreshTokens.slice(-5);
            }
        }

        const updatedUser = await this.userModel.findOneAndUpdate(
            { _id: new Types.ObjectId(user_id) },
            payloadData,
            { new: true }
        ).exec();

        if (!updatedUser) {
            throw new NotFoundException("Utilisateur introuvable après mis à jours!")
        }

        return {
            data: updatedUser,
            message: "Utilisateur mis à jour avec succès!"
        }
    }

    async changePwd(form: any): Promise<ServiceResponse<null>> {
        const { id, oldPwd, newPwd } = form;

        const getUser = await this.userModel.findById(new Types.ObjectId(id)).select("+password").exec();
        if (!getUser) {
            throw new NotFoundException("Utilisateur introuvable !");
        }

        if (getUser.hasPassword) {
            const verifPwd = await bcrypt.compare(oldPwd, getUser.password!);
            if (!verifPwd) {
                throw new BadRequestException("Ancien mot de passe incorrect !")
            }
        }

        try {
            await this.updateUser(getUser.id, { password: newPwd });
            return {
                data: null,
                message: "Mot de passe changé avec succès !"
            }

        } catch (error) {
            throw new InternalServerErrorException("Problème lors de la changement du mot de passe !")
        }

    }

    async getAllUsers(params: any): Promise<ServiceResponse<any>> {
        const { search, page, limit } = params;

        const getAdminRole = await this.roleService.getRoleByName(Roles.admin);
        if (!getAdminRole.data) {
            throw new NotFoundException("Role admin est introuvable !")
        }

        const filter: any = {
            role: { $ne: getAdminRole.data._id }
        }
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { fullname: regex },
                { email: regex },
                { phone: regex },
                { username: regex },
            ];
        }

        const skip = (page - 1) * limit;

        const data = await this.userModel.find(filter).skip(skip).limit(limit).exec();
        const total = await this.userModel.countDocuments(filter).exec();

        return {
            data: {
                users: data,
                total,
                page,
                limit
            }
        }
        // return this.userModel.find().exec();
        //     .then(users => ({
        //         data: users || [],
        //     }))
        //     .catch(error => {
        //         throw new InternalServerErrorException("Problème dans la récupération des utilisateurs !")
        //     });
    }

    async getUserById(id: string, relations?: any[], session?: ClientSession): Promise<ServiceResponse<UserDocument | null>> {
        const populateConfig = relations ? buildPopulateConfig(relations) : []
        const user = await this.userModel.findOne({
            _id: id
        }).populate('role').populate(populateConfig).session(session ?? null).exec();

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
        }).select(['+password', "+resetToken", "+resetTokenExpiration"]).populate('role').exec()

        return {
            data: user
        };
    }



    async verifUniqueCredentials(form: any, user_id?: string): Promise<{ field: string; message: string }[]> {
        const errors: { field: string; message: string }[] = [];
        try {
            const user = await this.userModel.findOne({
                _id: { $ne: new Types.ObjectId(user_id) },
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


    async addRefreshToken(userId: string, tokenData: { jti:string, tokenHash: string; device: string; createdAt: Date; expiresAt: Date }) {
        // Limite 5 devices maximum
        await this.userModel.updateOne(
            { _id: userId },
            {
                $push: {
                    refreshTokens: {
                        $each: [tokenData],
                        $slice: -5,
                    },
                },
            }
        );
    }



}
