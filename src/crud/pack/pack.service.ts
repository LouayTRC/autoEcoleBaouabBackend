import { InjectModel } from "@nestjs/mongoose";
import { Pack, PackDocument } from "./pack.schema";
import { ClientSession, Model } from "mongoose";
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ServiceResponse } from "src/common/types";
import { PermisService } from "../permis/permis.service";
import { ServicesService } from "../services/services.service";
import { ServiceDetail } from "src/common/snapshotTypes";
import path from "path";
import { Tarif } from "../tarif/tarif.schema";
import { Services } from "../services/services.schema";


@Injectable()
export class PackService {

    constructor(
        @InjectModel(Pack.name) private packModel: Model<PackDocument>,
        private permisService: PermisService,
        private servicesService: ServicesService
    ) { }

    // async addPack(form: any, session?: ClientSession): Promise<ServiceResponse<PackDocument>> {

    //     const { name, description, permis, services, reduction = 0, price = 0 } = form


    //     const getPermis = await this.permisService.getPermisById(permis, [], session);
    //     if (!getPermis.data) {
    //         throw new NotFoundException("Ce permis est introuvable !");
    //     }

    //     let packServices: ServiceDetail[] = []

    //     let total = 0;

    //     for (const s of services) {

    //         const getService = await this.servicesService.getServiceByName(s.serviceName, session);
    //         if (!getService.data) {
    //             throw new NotFoundException(`Le service ${s.serviceName} est introuvable !`);
    //         }

    //         const tarif = getService.data.tarifs?.find((e: Tarif) => e.permis.name === getPermis.data!.name);
    //         if (!tarif) throw new NotFoundException(`Tarif pour ${getService.data.name} introuvable !`);

    //         const packServicePrice = tarif.price;
    //         const totalServicePrice = (s.quantity * packServicePrice)

    //         const newPackService: ServiceDetail = {
    //             service: getService.data._id,
    //             serviceName: getService.data.name,
    //             qte: s.quantity,
    //             unitPrice: packServicePrice,
    //             total: totalServicePrice
    //         }


    //         packServices.push(newPackService);
    //         total += totalServicePrice
    //     }

    //     let finalPrice = 0;
    //     let finalReduction = 0;

    //     if (price && price > 0) {
    //         // le frontend donne le prix final, on calcule la reduction
    //         finalPrice = price;
    //         finalReduction = ((total - price) * 100) / total;
    //     } else if (reduction && reduction > 0) {
    //         // le frontend donne la réduction, on calcule le prix final
    //         finalReduction = reduction;
    //         finalPrice = total - (total * reduction) / 100;
    //     } else {
    //         // aucun des deux donné
    //         finalPrice = total;
    //         finalReduction = 0;
    //     }

    //     try {
    //         const newPack = new this.packModel({
    //             name,
    //             description,
    //             permis: {
    //                 permis_id: getPermis.data._id,
    //                 permisName: getPermis.data.name
    //             },
    //             details: packServices,
    //             price: total,             // prix brut (avant réduction)
    //             reduction: finalReduction,
    //             total: finalPrice,        // prix final après réduction
    //             image: "permis/allPermis.jpeg",
    //             status: 1
    //         });

    //         await newPack.save({ session });

    //         const returnPack: any = newPack.toObject()
    //         delete returnPack._id;

    //         return {
    //             data: returnPack,
    //             message: "Pack créé avec succès !"
    //         }


    //     } catch (error) {
    //         throw new InternalServerErrorException("Problème lors de la création du pack !")
    //     }
    // }


    // async getAllPacks(status?: number): Promise<ServiceResponse<Pack[]>> {
    //     const filter: any = {};


    //     if (status) {
    //         filter.status = status
    //     }


    //     const packs = await this.packModel.find(filter).populate({ path: 'details.service', model: Services.name });
    //     return {
    //         data: packs
    //     }
    // }


    // async getPackById(pack_id: string, session?: ClientSession): Promise<ServiceResponse<PackDocument | null>> {
    //     const pack = await this.packModel.findById(pack_id).populate("permis").session(session ?? null);

    //     return {
    //         data: pack
    //     }
    // }


    // async updatePack(
    //     pack_id: string,
    //     packData: any,
    //     session?: ClientSession
    // ): Promise<ServiceResponse<PackDocument>> {
    //     try {
    //         // Vérifier si le pack existe
    //         const existingPack = await this.packModel.findById(pack_id).session(session ?? null).exec();
    //         if (!existingPack) {
    //             throw new NotFoundException("Ce pack est introuvable !");
    //         }

    //         // Préparer les données de mise à jour
    //         const updatePayload: any = {};
    //         if (packData.name) updatePayload.name = packData.name;
    //         if (packData.image) updatePayload.image = packData.image;
    //         if (packData.description) updatePayload.description = packData.description;
    //         if (packData.permis) updatePayload.permis = packData.permis;
    //         if (packData.details) updatePayload.details = packData.details;
    //         if (typeof packData.price === "number") updatePayload.price = packData.price;
    //         if (typeof packData.reduction === "number") updatePayload.reduction = packData.reduction;
    //         if (typeof packData.total === "number") updatePayload.total = packData.total;
    //         if (typeof packData.status === "number") updatePayload.status = packData.status;

    //         // Effectuer la mise à jour
    //         const updatedPack = await this.packModel.findByIdAndUpdate(
    //             pack_id,
    //             updatePayload,
    //             { new: true }
    //         ).session(session ?? null).exec();

    //         if (!updatedPack) {
    //             throw new NotFoundException("Pack introuvable après mise à jour");
    //         }

    //         return { message: "Pack mis à jour avec succès", data: updatedPack };
    //     } catch (error: any) {
    //         if (error instanceof ConflictException || error instanceof NotFoundException) {
    //             throw error;
    //         }
    //         console.error("Erreur lors de updatePack:", error);
    //         throw new InternalServerErrorException("Erreur lors de la mise à jour du pack");
    //     }
    // }

}
