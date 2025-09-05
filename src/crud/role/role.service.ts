import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './role.schema';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class RoleService {

    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>
    ) { }

    async create(form: any): Promise<ServiceResponse<Role | null>> {
        const { name } = form

        const existingRole = await this.getRoleByName(name);
        if (existingRole.data) {
            throw new ConflictException("Ce role existe déja !")
        }

        try {
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
        const roles = await this.roleModel.find().exec();
        return {
            data: roles,
        }
    }


    async getRoleByName(name: string): Promise<ServiceResponse<RoleDocument | null>> {
        const role = await this.roleModel.findOne({ name }).exec();
        return {
            data: role
        }
    }

    async getRoleById(id: string): Promise<ServiceResponse<Role | null>> {
        const role = await this.roleModel.findById(id).exec();
        return {
            data: role
        }
    }
}
