import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permis, PermisDocument } from './permis.schema';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';
import { error } from 'console';

@Injectable()
export class PermisService {

    constructor(@InjectModel(Permis.name) private permisModel: Model<PermisDocument>) { }

    async create(form: any): Promise<ServiceResponse<Permis | null>> {
        try {
            const createdPermis = await this.permisModel.create({
                type: form.type
            })
            return { success: true, message: "Permis créé avec succès", data: createdPermis }
        } catch (error: any) {
            return { success: true, message: error?.message, data: null, errorCode: 500 }
        }
    }

    async getAll(): Promise<ServiceResponse<Permis[]>> {
        try {
            const permis = await this.permisModel.find().exec()
            return {
                success: true,
                data: permis || [],
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                message: error?.message || 'Erreur lors de la récupération',
                errorCode: 500,
            };
        }
    }

    async getPermisById(id: string): Promise<ServiceResponse<Permis | null>> {
        try {
            const permis = await this.permisModel.findById(id).exec();
            if (!permis) {
                return { success: false, data: null, message: 'Permis non trouvé', errorCode: 404 };
            }
            return { success: true, data: permis, message: 'Permis trouvé' };
        } catch (error: any) {
            return { success: false, data: null, message: error.message, errorCode: 500 };
        }
    }

    async findByType(type: string): Promise<ServiceResponse<Permis | null>> {
        try {
            const permis = await this.permisModel.findOne({ type }).exec();
            if (!permis) {
                return { success: false, data: null, message: 'Permis non trouvé' };
            }
            return { success: true, data: permis, message: 'Permis trouvé' };
        } catch (error: any) {
            return { success: false, data: null, message: error.message, errorCode: 500 };
        }
    }


}
