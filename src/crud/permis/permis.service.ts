import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permis, PermisDocument } from './permis.schema';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class PermisService {

    constructor(@InjectModel(Permis.name) private permisModel: Model<PermisDocument>) { }

    async create(form: any): Promise<ServiceResponse<Permis | null>> {
        try {
            const createdPermis = await this.permisModel.create({
                type: form.type
            })
            return { message: "Permis créé avec succès", data: createdPermis }
        } catch (error: any) {
            throw new InternalServerErrorException("Problème dans la création du permis")
        }
    }

    async getAll(): Promise<ServiceResponse<Permis[]>> {
        try {
            const permis = await this.permisModel.find().exec()
            return {
                data: permis || [],
            };
        } catch (error) {
            throw new InternalServerErrorException('Erreur lors de la récupération des permis')
        }
    }

    async getPermisById(id: string): Promise<ServiceResponse<Permis | null>> {
            const permis = await this.permisModel.findById(id).exec();
            if (!permis) {
                throw new NotFoundException('Permis non trouvé')
            }
            return { data: permis, message: 'Permis trouvé' };
        
    }

    async findByType(type: string): Promise<ServiceResponse<Permis | null>> {
        const permis = await this.permisModel.findOne({ type }).exec();
        if (!permis) {
            throw new NotFoundException('Permis non trouvé')
        }
        return { data: permis, message: 'Permis trouvé' };

    }


}
