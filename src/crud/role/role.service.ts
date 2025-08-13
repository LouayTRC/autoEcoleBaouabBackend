import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './role.schema';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class RoleService {

    constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) { }

    async create(form: any): Promise<ServiceResponse<Role | null>> {
        try {
            const { name } = form

            const newRole = await this.roleModel.create({
                name
            })

            return {
                success: true,
                data: newRole,
                message: "Role créé avec succès"
            }
        } catch (error) {
            return {
                success: true,
                data: null,
                message: error.message || "Problème dans la création du role"
            }
        }
    }

    async getRoles(): Promise<ServiceResponse<Role[]>> {
        try {
            const roles = await this.roleModel.find().exec();

            return {
                success: true,
                data: roles || [],
            }

        } catch (error) {
            return {
                success: true,
                data: [],
                message: error.message || "Aucun Role trouvé",
                errorCode: 500
            }
        }
    }


    async getRoleByName(name: string): Promise<ServiceResponse<Role | null>> {
        try {
            const role = await this.roleModel.findOne({ name }).exec();

            if (!role) {
                return {
                    success: false,
                    data: null,
                    message: 'Role introuvable !',
                    errorCode: 404
                }
            }
            return {
                success: true,
                data: role
            }

        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message || 'Problème dans la recherche du role',
                errorCode: 500
            }
        }
    }

    async getRoleById(id: string): Promise<ServiceResponse<Role | null>> {
        try {
            const role = await this.roleModel.findOne({ _id:id }).exec();

            if (!role) {
                return {
                    success: false,
                    data: null,
                    message: 'Role introuvable !',
                    errorCode: 404
                }
            }
            return {
                success: true,
                data: role
            }

        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message || 'Problème dans la recherche du role',
                errorCode: 500
            }
        }
    }
}
