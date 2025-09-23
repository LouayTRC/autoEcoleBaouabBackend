import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permis, PermisDocument } from './permis.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';
import { Tarif } from '../tarif/tarif.schema';

@Injectable()
export class PermisService {

    constructor(@InjectModel(Permis.name) private permisModel: Model<PermisDocument>) { }

    startSession(): Promise<ClientSession> {
        return this.permisModel.startSession();
    }

    async create(form: any, session?: ClientSession): Promise<ServiceResponse<PermisDocument>> {
        // Si aucune session fournie, créer une nouvelle session
        const ownSession = !session;
        const currentSession = session || await this.permisModel.db.startSession();

        const { name } = form;

        // Vérifier si le permis existe déjà, en utilisant la session
        const existingPermis = await this.getPermisByName(name, currentSession);
        if (existingPermis.data) {
            throw new ConflictException("Ce permis existe déjà !");
        }

        try {
            // Démarrer la transaction si on a créé la session
            if (ownSession) {
                currentSession.startTransaction();
            }

            // Créer le permis
            let [createdPermis] = await this.permisModel.create([{
                name,
                image: "permis/allPermis.jpeg",
                createdAt: new Date()
            }], { session: currentSession });

            // Commit de la transaction si on a créé la session
            if (ownSession) {
                await currentSession.commitTransaction();
            }

            return {
                message: "Permis créé avec succès",
                data: createdPermis.toObject ? createdPermis.toObject() : createdPermis
            };
        } catch (error: any) {
            // Rollback si on a créé la session
            if (ownSession) {
                await currentSession.abortTransaction();
            }
   
            throw new InternalServerErrorException("Problème dans la création du permis !");
        } finally {
            // Terminer la session si on l’a créée
            if (ownSession) {
                currentSession.endSession();
            }
        }
    }


    async update(id: string, updateData: any, session?: ClientSession): Promise<ServiceResponse<PermisDocument>> {
        try {
            // Vérifier si le permis existe
            const existingPermis = await this.permisModel.findById(id).session(session ?? null).exec();
            if (!existingPermis) {
                throw new NotFoundException("Permis introuvable");
            }

            // Vérifier si le nouveau nom existe déjà (sauf pour le permis actuel)
            if (updateData.name && updateData.name !== existingPermis.name) {
                const duplicatePermis = await this.permisModel.findOne({
                    name: updateData.name,
                    _id: { $ne: id }
                }).session(session ?? null).exec();
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
            ).session(session ?? null).exec();

            if (!updatedPermis) {
                throw new NotFoundException("Permis introuvable après mise à jour");
            }

            return { message: "Permis mis à jour avec succès", data: updatedPermis };
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }


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

    async getAll(relations: any): Promise<ServiceResponse<Permis[]>> {
        const filter = {
            deletedAt: { $exists: false },
        }

        const populateConfig = relations ? buildPopulateConfig(relations) : []

        populateConfig.push({
            path: "tarifs",
            populate: {
                path: "service",
                model: "Services", // nom du modèle Service
                match: { deletedAt: { $exists: false } }
            }
        });

        const permis = await this.permisModel.find(filter).populate(populateConfig).exec();

        permis.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

        permis.forEach((p: any) => {
            if (p.tarifs.length) {
                p.tarifs = p.tarifs.sort((a: Tarif, b: Tarif) => {
                    const nameA = a.service?.name.toLowerCase() ?? '';
                    const nameB = b.service?.name.toLowerCase() ?? '';
                    return nameA.localeCompare(nameB);
                });
            }
        });
        return {
            data: permis,
        };
    }

    async getPermisById(id: string, relations?: any[], session?: ClientSession): Promise<ServiceResponse<PermisDocument | null>> {
        const populateConfig = relations ? buildPopulateConfig(relations) : []

        const permis = await this.permisModel.findOne({
            _id: new Types.ObjectId(id),
            deletedAt: { $exists: false }
        }).populate(populateConfig).session(session ?? null).exec();
        return {
            data: permis
        }
    }

    async getPermisByName(name: string, session?: ClientSession): Promise<ServiceResponse<PermisDocument | null>> {
        const permis = await this.permisModel.findOne({
            name,
            deletedAt: { $exists: false }
        }).session(session ?? null).exec();
        return {
            data: permis
        }
    }
}