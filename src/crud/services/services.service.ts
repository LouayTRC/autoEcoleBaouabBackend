import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceDocument, Services } from './service.schema';
import { ClientSession, Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';
import { TarifService } from '../tarif/tarif.service';
import path from 'path';
import { Tarif } from '../tarif/tarif.schema';



@Injectable()
export class ServicesService {

    constructor(
        @InjectModel(Services.name) private servicesModel: Model<Services>,
        @Inject(forwardRef(() => TarifService)) private readonly tarifService: TarifService,
    ) { }


    async createService(form: any, session?: ClientSession): Promise<ServiceResponse<any>> {
        const { service, tarifs } = form;
        console.log("form", form);

        // Si session n'est pas fournie, on en crée une
        const ownSession = !session;
        const currentSession = session || await this.servicesModel.db.startSession();

        try {
            if (ownSession) {
                currentSession.startTransaction();
            }

            let createdService: any;
            let tarifsResult: any;

            const ancienService = await this.getServiceByName(service.name, currentSession);
            if (ancienService.data) {
                throw new ConflictException("Ce service existe déja !");
            }

            // 1. Créer le service
            createdService = await this.servicesModel.create([{
                name: service.name,
                echelle: service.echelle,
                description: service.description,
                image: "permis/allPermis.jpeg",
                createdAt: new Date()
            }], { session: currentSession });

            createdService = createdService[0];
            console.log("vv", createdService);

            // 2. Créer les tarifs
            tarifsResult = await this.tarifService.addTarifs(createdService.id, tarifs, currentSession);
            console.log("dd", tarifsResult.data);

            if (ownSession) {
                await currentSession.commitTransaction();
            }

            return {
                data: {
                    ...(createdService.toObject ? createdService.toObject() : createdService),
                    ...tarifsResult.data,
                    ...(tarifsResult.data.errors && { errors: tarifsResult.data.errors })
                },
                message: `Service créé avec succès`
            };

        } catch (error) {
            console.log("erro", error);

            if (ownSession) {
                await currentSession.abortTransaction();
            }

            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Problème lors de la création du service: ${error.message}`
            );
        } finally {
            if (ownSession) {
                await currentSession.endSession();
            }
        }
    }


    async getAllServices(): Promise<ServiceResponse<Services[]>> {
        let services = await this.servicesModel.find()
            .populate({
                path: "tarifs",
                populate: {
                    path: "permis",
                    match: { deletedAt: null }
                }
            })
            .exec()

        services = services.map((service:any) => {
            service.tarifs = service.tarifs.filter((tarif:Tarif) => tarif.permis !== null);
            return service;
        });
        return {
            data: services
        }
    }

    async getServiceById(id: string, session?: ClientSession): Promise<ServiceResponse<ServiceDocument | null>> {
        const service = await this.servicesModel.findById(id).session(session ?? null).exec();
        return {
            data: service
        }
    }

    async getServiceByName(name: string, session: ClientSession): Promise<ServiceResponse<Services | null>> {
        const service = await this.servicesModel.findOne({ name }).session(session ?? null).exec();
        return {
            data: service
        }
    }

    async update(id: string, updateData: any, session?: any): Promise<ServiceResponse<Services>> {
        try {
            // Options pour les requêtes MongoDB
            const options: any = { new: true };
            if (session) {
                options.session = session;
            }

            // Vérifier si le service existe
            const existingService = await this.servicesModel.findById(id, null, options);
            if (!existingService) {
                throw new NotFoundException("Service introuvable 2");
            }

            // Vérifier si le nouveau nom existe déjà (sauf pour le service actuel)
            if (updateData.name && updateData.name !== existingService.name) {
                const duplicateOptions: any = {};
                if (session) {
                    duplicateOptions.session = session;
                }

                const duplicateService = await this.servicesModel.findOne({
                    name: updateData.name,
                    _id: { $ne: id }
                }, null, duplicateOptions);

                if (duplicateService) {
                    throw new ConflictException("Un service avec ce nom existe déjà !");
                }
            }

            // Préparer les données de mise à jour
            const updatePayload: any = {};
            if (updateData.name) updatePayload.name = updateData.name;
            if (updateData.echelle) updatePayload.echelle = updateData.echelle;
            if (updateData.description) updatePayload.description = updateData.description;
            if (updateData.image) updatePayload.image = updateData.image;

            const updatedService = await this.servicesModel.findByIdAndUpdate(
                id,
                updatePayload,
                { ...options, new: true }
            ).lean()

            if (!updatedService) {
                throw new NotFoundException("Service introuvable après mise à jour");
            }


            return {
                message: "Service mis à jour avec succès",
                data: updatedService
            };
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            console.log("error", error);
            throw new InternalServerErrorException("Erreur lors de la mise à jour du service");
        }
    }


    async delete(id: string): Promise<ServiceResponse<null>> {
        try {
            // Vérifier si le permis existe
            const existingService = await this.servicesModel.findById(id);
            if (!existingService) {
                throw new NotFoundException("Service introuvable");
            }

            // Soft delete - ajouter un champ deletedAt
            await this.servicesModel.findByIdAndUpdate(
                id,
                { deletedAt: new Date() },
                { new: true }
            );

            return { message: "Service supprimé avec succès", data: null };
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException("Erreur lors de la suppression du service");
        }
    }

}
