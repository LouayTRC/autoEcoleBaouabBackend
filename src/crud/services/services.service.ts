import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceDocument, Services } from './services.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { ServiceResponse } from 'src/common/types';
import { TarifService } from '../tarif/tarif.service';
import { Tarif } from '../tarif/tarif.schema';
import { PermisWithTarifs } from 'src/common/snapshotTypes';

@Injectable()
export class ServicesService {

    constructor(
        @InjectModel(Services.name) private servicesModel: Model<ServiceDocument>,
        @Inject(forwardRef(() => TarifService)) private readonly tarifService: TarifService
    ) { }

    // ---------------- CREATE ----------------
    async createService(form: any, session?: ClientSession): Promise<ServiceResponse<any>> {
        const { name, description, echelle, tarifs } = form;
    
        const ownSession = !session;
        const currentSession = session || await this.servicesModel.db.startSession();

        try {
            if (ownSession) await currentSession.startTransaction();

            // Vérifier unicité du nom FR
            const existingFr = await this.servicesModel.findOne({
                "name.fr": name.fr,
                deletedAt: { $exists: false }
            }).session(currentSession).exec();
            if (existingFr) throw new ConflictException("Un service avec ce nom (FR) existe déjà !");

            // Vérifier unicité du nom AR
            const existingAr = await this.servicesModel.findOne({
                "name.ar": name.ar,
                deletedAt: { $exists: false }
            }).session(currentSession).exec();
            if (existingAr) throw new ConflictException("Un service avec ce nom (AR) existe déjà !");

            // Créer le service
            let [createdService] = await this.servicesModel.create([{
                name: name,
                description: description,
                echelle: echelle,
                image: "services/default.jpeg",
                createdAt: new Date()
            }], { session: currentSession });

            let tarifsResult: any = { data: [] };
            // Créer les tarifs associés
            if (tarifs) {
                tarifsResult = await this.tarifService.addTarifsForServices(createdService.id, tarifs, currentSession);
            }

            if (ownSession) await currentSession.commitTransaction();

            return {
                data: {
                    ...(createdService.toObject ? createdService.toObject() : createdService),
                    tarifs: tarifsResult.data || [],
                    ...(tarifsResult.data?.errors && { errors: tarifsResult.data.errors })
                },
                message: "Service créé avec succès"
            };
        } catch (error: any) {
            if (ownSession) await currentSession.abortTransaction();
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException(`Problème lors de la création du service: ${error.message}`);
        } finally {
            if (ownSession) currentSession.endSession();
        }
    }

    // ---------------- GET ALL ----------------
    async getAllServices(): Promise<ServiceResponse<Services[]>> {
        let services = await this.servicesModel.find({ deletedAt: { $exists: false } })
            .populate({
                path: "tarifs",
                populate: {
                    path: "permis",
                    match: { deletedAt: { $exists: false } }
                }
            }).exec();

        // Filtrer les tarifs invalides
        services = services.map((service: any) => {
            service.tarifs = service.tarifs.filter((tarif: Tarif) => tarif.permis !== null);
            return service;
        });

        return { data: services };
    }

    // ---------------- GET BY ID ----------------
    async getServiceById(id: string, session?: ClientSession): Promise<ServiceResponse<ServiceDocument | null>> {
        const service = await this.servicesModel.findById(new Types.ObjectId(id))
            .session(session ?? null)
            .exec();
        return { data: service };
    }

    // ---------------- GET BY NAME (FR/AR) ----------------
    async getServiceByName(name: { fr: string; ar: string }, session?: ClientSession): Promise<ServiceResponse<PermisWithTarifs | null>> {
        const service = await this.servicesModel.findOne({
            $or: [
                { "name.fr": name.fr },
                { "name.ar": name.ar }
            ],
            deletedAt: { $exists: false }
        })
            .populate({
                path: "tarifs",
                populate: ["service", "permis"]
            })
            .session(session ?? null)
            .exec();

        return { data: service as PermisWithTarifs | null };
    }

    // ---------------- UPDATE ----------------
    async update(id: string, updateData: any, session?: ClientSession): Promise<ServiceResponse<Services>> {
        try {
            const options: any = { new: true };
            if (session) options.session = session;

            const existingService = await this.servicesModel.findById(id, null, options);
            if (!existingService) throw new NotFoundException("Service introuvable");

            // Vérifier unicité du nom FR
            if (updateData.name?.fr && updateData.name.fr !== existingService.name.fr) {
                const duplicateFr = await this.servicesModel.findOne({
                    "name.fr": updateData.name.fr,
                    _id: { $ne: id },
                    deletedAt: { $exists: false }
                }).session(session ?? null).exec();
                if (duplicateFr) throw new ConflictException("Un service avec ce nom (FR) existe déjà !");
            }

            // Vérifier unicité du nom AR
            if (updateData.name?.ar && updateData.name.ar !== existingService.name.ar) {
                const duplicateAr = await this.servicesModel.findOne({
                    "name.ar": updateData.name.ar,
                    _id: { $ne: id },
                    deletedAt: { $exists: false }
                }).session(session ?? null).exec();
                if (duplicateAr) throw new ConflictException("Un service avec ce nom (AR) existe déjà !");
            }

            // Préparer le payload de mise à jour
            const updatePayload: any = {};
            if (updateData.name) updatePayload.name = updateData.name;
            if (updateData.description) updatePayload.description = updateData.description;
            if (updateData.echelle) updatePayload.echelle = updateData.echelle;
            if (updateData.image) updatePayload.image = updateData.image;
            if (updateData.updatedAt) updatePayload.updatedAt = updateData.updatedAt;

            const updatedService = await this.servicesModel.findByIdAndUpdate(id, updatePayload, options).lean();
            if (!updatedService) throw new NotFoundException("Service introuvable après mise à jour");

            return { message: "Service mis à jour avec succès", data: updatedService };
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException("Erreur lors de la mise à jour du service");
        }
    }

    // ---------------- DELETE ----------------
    async delete(id: string): Promise<ServiceResponse<null>> {
        try {
            const existingService = await this.servicesModel.findById(id);
            if (!existingService) throw new NotFoundException("Service introuvable");

            await this.servicesModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
            return { message: "Service supprimé avec succès", data: null };
        } catch (error: any) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException("Erreur lors de la suppression du service");
        }
    }

    // ---------------- GET TARIFS BY PERMIS ----------------
    async getTarifsWithServicesByPermis(permis_id: string): Promise<ServiceResponse<Tarif[]>> {
        const relations = [{ path: "service" }];
        const tarifs = await this.tarifService.getTarifsByPermis(permis_id, relations);
        return { data: tarifs.data };
    }
}
