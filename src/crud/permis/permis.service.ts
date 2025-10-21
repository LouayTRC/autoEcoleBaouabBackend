import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permis, PermisDocument } from './permis.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';
import { Tarif } from '../tarif/tarif.schema';

@Injectable()
export class PermisService {
    constructor(
        @InjectModel(Permis.name) private permisModel: Model<PermisDocument>
    ) { }

    startSession(): Promise<ClientSession> {
        return this.permisModel.startSession();
    }

    // ---------------- CREATE ----------------
    async create(form: any, session?: ClientSession): Promise<ServiceResponse<PermisDocument>> {
        const ownSession = !session;
        const currentSession = session || await this.permisModel.db.startSession();

        const { name, typeVehicule, description } = form;

        try {
            if (ownSession) currentSession.startTransaction();

            // Vérifier unicité du nom FR
            const existingFr = await this.permisModel.findOne({
                "name.fr": name.fr,
                deletedAt: { $exists: false }
            }).session(currentSession).exec();
            if (existingFr) throw new ConflictException("Un permis avec ce nom (FR) existe déjà !");

            // Vérifier unicité du nom AR (optionnel)
            const existingAr = await this.permisModel.findOne({
                "name.ar": name.ar,
                deletedAt: { $exists: false }
            }).session(currentSession).exec();
            if (existingAr) throw new ConflictException("Un permis avec ce nom (AR) existe déjà !");

            const [createdPermis] = await this.permisModel.create([{
                name,
                typeVehicule,
                description,
                image: "permis/allPermis.jpeg",
                createdAt: new Date()
            }], { session: currentSession });

            if (ownSession) await currentSession.commitTransaction();

            return {
                message: "Permis créé avec succès",
                data: createdPermis.toObject ? createdPermis.toObject() : createdPermis
            };
        } catch (error: any) {
            if (ownSession) await currentSession.abortTransaction();
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException("Problème dans la création du permis !");
        } finally {
            if (ownSession) currentSession.endSession();
        }
    }

    // ---------------- UPDATE ----------------
    async update(id: string, updateData: any, session?: ClientSession): Promise<ServiceResponse<PermisDocument>> {
        try {
            const existing = await this.permisModel.findById(id).session(session ?? null).exec();
            if (!existing) throw new NotFoundException("Permis introuvable");

            // Vérifier unicité pour FR
            if (updateData.name?.fr && updateData.name.fr !== existing.name.fr) {
                const duplicateFr = await this.permisModel.findOne({
                    "name.fr": updateData.name.fr,
                    _id: { $ne: id },
                    deletedAt: { $exists: false }
                }).session(session ?? null).exec();
                if (duplicateFr) throw new ConflictException("Un permis avec ce nom (FR) existe déjà !");
            }

            // Vérifier unicité pour AR
            if (updateData.name?.ar && updateData.name.ar !== existing.name.ar) {
                const duplicateAr = await this.permisModel.findOne({
                    "name.ar": updateData.name.ar,
                    _id: { $ne: id },
                    deletedAt: { $exists: false }
                }).session(session ?? null).exec();
                if (duplicateAr) throw new ConflictException("Un permis avec ce nom (AR) existe déjà !");
            }

            const updatePayload: any = {};
            if (updateData.name) updatePayload.name = updateData.name;
            if (updateData.typeVehicule) updatePayload.typeVehicule = updateData.typeVehicule;
            if (updateData.description) updatePayload.description = updateData.description;
            if (updateData.image) updatePayload.image = updateData.image;

            const updatedPermis = await this.permisModel.findByIdAndUpdate(
                id,
                updatePayload,
                { new: true }
            ).session(session ?? null).exec();

            if (!updatedPermis) throw new NotFoundException("Permis introuvable après mise à jour");

            return { message: "Permis mis à jour avec succès", data: updatedPermis };
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException("Erreur lors de la mise à jour du permis");
        }
    }

    // ---------------- DELETE ----------------
    async delete(id: string): Promise<ServiceResponse<null>> {
        try {
            const existing = await this.permisModel.findById(id);
            if (!existing) throw new NotFoundException("Permis introuvable");

            await this.permisModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
            return { message: "Permis supprimé avec succès", data: null };
        } catch (error: any) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException("Erreur lors de la suppression du permis");
        }
    }

    // ---------------- GET ALL ----------------
    async getAll(relations?: any[]): Promise<ServiceResponse<PermisDocument[]>> {
        const filter = { deletedAt: { $exists: false } };
        const populateConfig = relations ? buildPopulateConfig(relations) : [];

        populateConfig.push({
            path: "tarifs",
            populate: {
                path: "service",
                model: "Services",
                match: { deletedAt: { $exists: false } }
            }
        });

        const permis = await this.permisModel.find(filter).populate(populateConfig).exec();

        // Tri par FR
        permis.sort((a, b) => a.name.fr.localeCompare(b.name.fr, undefined, { sensitivity: 'base' }));

        // Tri des tarifs par nom du service
        permis.forEach((p: any) => {
            if (p.tarifs.length) {
                p.tarifs = p.tarifs.sort((a: Tarif, b: Tarif) => {
                    const nameA = a.service?.name?.fr?.toLowerCase() ?? '';
                    const nameB = b.service?.name?.fr?.toLowerCase() ?? '';
                    return nameA.localeCompare(nameB);
                });
            }
        });

        return { data: permis };
    }

    // ---------------- GET BY ID ----------------
    async getPermisById(id: string, relations?: any[], session?: ClientSession): Promise<ServiceResponse<PermisDocument | null>> {
        const populateConfig = relations ? buildPopulateConfig(relations) : [];
        const permis = await this.permisModel.findOne({
            _id: new Types.ObjectId(id),
            deletedAt: { $exists: false }
        }).populate(populateConfig).session(session ?? null).exec();

        return { data: permis };
    }

    // ---------------- GET BY NAME (FR/AR) ----------------
    async getPermisByName(name: string, lang: 'fr' | 'ar' = 'fr', session?: ClientSession): Promise<ServiceResponse<PermisDocument | null>> {
        const field = `name.${lang}`;
        const permis = await this.permisModel.findOne({
            [field]: name,
            deletedAt: { $exists: false }
        }).session(session ?? null).exec();

        return { data: permis };
    }
}
