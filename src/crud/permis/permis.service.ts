import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permis, PermisDocument } from './permis.schema';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class PermisService {

    constructor(@InjectModel(Permis.name) private permisModel: Model<PermisDocument>) { }

    async create(form: any): Promise<ServiceResponse<Permis>> {
        const {type}=form
    
        const existingPermis= await this.getPermisByType(type)
        if (existingPermis) {
            throw new ConflictException("Ce permis existe déja !")
        }

        try {
            const createdPermis = await this.permisModel.create({
                type
            })
            return { message: "Permis créé avec succès", data: createdPermis }
        } catch (error: any) {
            throw new InternalServerErrorException("Problème dans la création du permis !")
        }
    }

    async getAll(): Promise<ServiceResponse<Permis[]>> {
        const permis = await this.permisModel.find().exec()
        return {
            data: permis,
        };
    }

    async getPermisById(id: string): Promise<ServiceResponse<Permis | null>> {
        const permis=await this.permisModel.findById(id).exec();
        return {
            data:permis
        }
    }

    async getPermisByType(type: string): Promise<ServiceResponse<Permis | null>> {
        const permis=await this.permisModel.findOne({type}).exec();
        return {
            data:permis
        }
    }


}
