import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Commande } from './commande.schema';
import { Model } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';
// import { PackService } from '../pack/pack.service';

@Injectable()
export class CommandeService {

    constructor(
        @InjectModel(Commande.name) private commandeModel: Model<Commande>,
        // private packService: PackService
    ) { }

    // async addCommande(form: any, user_id: string): Promise<ServiceResponse<Commande>> {
    //     const { pack_id } = form

    //     const relations= [
    //         {
    //             path:"packServices",
    //             childs:[
    //                 {path:"service"}
    //             ]
    //         }
    //     ]
    //     const pack = await this.packService.getPackById(pack_id,relations);
    //     if (!pack.data) {
    //         throw new NotFoundException("Ce pack est introuvable !");
    //     }

    //     try {
    //         const commande = await this.commandeModel.create({
    //             price: pack.data.price,
    //             packs: [{
    //                 pack_id:pack.data.id,
    //                 name: pack.data.name,
    //                 price: pack.data.price,
    //                 packServices: pack.data.packServices ? pack.data.packServices.map((p)=>({
    //                     packService_id:p.id,
    //                     service:p.service,
    //                     hours:p.hours
    //                 })) : []
    //             }],
    //             client: user_id,
    //             created_at: new Date().toISOString()
    //         })

    //         return {
    //             data: commande,
    //             message: "Commande créé avec succès !"
    //         }
    //     } catch (error) {
    //         throw new InternalServerErrorException("Problème dans la création du commande !")
    //     }
    // }


    // async getAllCommands(relations?: any[]): Promise<ServiceResponse<Commande[]>> {
    //     try {
    //         const populateConfig = relations ? buildPopulateConfig(relations) : [];

    //         let query = this.commandeModel.find();
    //         if (populateConfig.length > 0) {
    //             query = query.populate(populateConfig);
    //         }

    //         const commandes = await query.exec()
    //         return {
    //             data: commandes
    //         }
    //     } catch (error) {
    //         throw new InternalServerErrorException("Problème dans la récupération des commandes !")
    //     }


    // }


    // async getClientCommands(user_id: string,relations?:any[]): Promise<ServiceResponse<Commande[]>> {
    //     try {
    //         const populateConfig = relations ? buildPopulateConfig(relations) : [];

    //         let query = this.commandeModel.find({client:user_id});
    //         if (populateConfig.length > 0) {
    //             query = query.populate(populateConfig);
    //         }

    //         const commandes = await query.exec()
    //         return {
    //             data: commandes
    //         }
    //     } catch (error) {
    //         throw new InternalServerErrorException("Problème dans la récupération des commandes !")
    //     }
    // }
}
