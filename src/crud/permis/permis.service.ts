import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permis, PermisDocument } from './permis.schema';
import { ClientSession, Model } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';

@Injectable()
export class PermisService {

    constructor(@InjectModel(Permis.name) private permisModel: Model<PermisDocument>) { }

    async create(form: any): Promise<ServiceResponse<PermisDocument>> {
        const { name } = form

        const existingPermis = await this.getPermisByName(name)
        if (existingPermis.data) {
            throw new ConflictException("Ce permis existe déja !")
        }

        try {
            const createdPermis = await this.permisModel.create({
                name,
                image: "permis/allPermis.jpeg",
                createdAt:new Date()
            })

           
            return { message: "Permis créé avec succès", data: createdPermis }
        } catch (error: any) {
            console.log("err", error);
            throw new InternalServerErrorException("Problème dans la création du permis !")
        }
    }

    async update(id: string, updateData: any): Promise<ServiceResponse<PermisDocument>> {
        try {
            // Vérifier si le permis existe
            const existingPermis = await this.permisModel.findById(id);
            if (!existingPermis) {
                throw new NotFoundException("Permis introuvable");
            }

            // Vérifier si le nouveau nom existe déjà (sauf pour le permis actuel)
            if (updateData.name && updateData.name !== existingPermis.name) {
                const duplicatePermis = await this.permisModel.findOne({ 
                    name: updateData.name, 
                    _id: { $ne: id }
                });
                if (duplicatePermis) {
                    throw new ConflictException("Un permis avec ce nom existe déjà !");
                }
            }
            
            // Préparer les données de mise à jour
            const updatePayload: any = {};
            if (updateData.name) updatePayload.name = updateData.name;
            if (updateData.image) updatePayload.image = updateData.image;

            const updatedPermis = await this.permisModel.findByIdAndUpdate(
                id, 
                updatePayload, 
                { new: true }
            );

            if (!updatedPermis) {
                throw new NotFoundException("Permis introuvable après mise à jour");
            }

            return { message: "Permis mis à jour avec succès", data: updatedPermis };
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            console.log("erer",error);
            
            throw new InternalServerErrorException("Erreur lors de la mise à jour du permis");
        }
    }

    async delete(id: string): Promise<ServiceResponse<null>> {
        try {
            // Vérifier si le permis existe
            const existingPermis = await this.permisModel.findById(id);
            if (!existingPermis) {
                throw new NotFoundException("Permis introuvable");
            }

            // Soft delete - ajouter un champ deletedAt
            await this.permisModel.findByIdAndUpdate(
                id, 
                { deletedAt: new Date() }, 
                { new: true }
            );

            return { message: "Permis supprimé avec succès", data: null };
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException("Erreur lors de la suppression du permis");
        }
    }

    async getAll(): Promise<ServiceResponse<Permis[]>> {
        // Exclure les permis supprimés (soft delete)
        const permis = await this.permisModel.find({ 
            deletedAt: { $exists: false } 
        }).exec()
        return {
            data: permis,
        };
    }

    async getPermisById(id: string,relations?:any[],session?:ClientSession): Promise<ServiceResponse<PermisDocument | null>> {
        const populateConfig= relations ? buildPopulateConfig(relations) : []

        const permis = await this.permisModel.findOne({ 
            _id: id, 
            deletedAt: { $exists: false } 
        }).populate(populateConfig).session(session ?? null).exec();
        return {
            data: permis
        }
    }

    async getPermisByName(name: string): Promise<ServiceResponse<PermisDocument | null>> {
        const permis = await this.permisModel.findOne({ 
            name, 
            deletedAt: { $exists: false } 
        }).exec();
        return {
            data: permis
        }
    }
}