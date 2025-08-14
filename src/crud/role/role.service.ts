import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
                data: newRole,
                message: "Role créé avec succès"
            }
        } catch (error) {
            throw new InternalServerErrorException("Problème dans la création du role")
        }
    }

    async getRoles(): Promise<ServiceResponse<Role[]>> {
        try {
            const roles = await this.roleModel.find().exec();

            return {
                data: roles || [],
            }

        } catch (error) {
            throw new InternalServerErrorException("Problème dans la récupération des roles !")
        }
    }


    async getRoleByName(name: string): Promise<Role | null> {
        return await this.roleModel.findOne({ name }).exec();
    }

    async getRoleById(id: string): Promise<ServiceResponse<Role>> {
        try {
            const role = await this.roleModel.findOne({ _id: id }).exec();

            if (!role) {
                throw new NotFoundException('Role introuvable !')
            }
            return {
                data: role
            }

        } catch (error) {
            throw new InternalServerErrorException('Problème dans la recherche du role')
        }
    }
}
