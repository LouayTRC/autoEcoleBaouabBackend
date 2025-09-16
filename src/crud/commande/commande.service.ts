import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Commande } from './commande.schema';
import { ClientSession, Model } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';
import { PackService } from '../pack/pack.service';
import { ServiceDetail } from 'src/common/snapshotTypes';

@Injectable()
export class CommandeService {

    constructor(
        @InjectModel(Commande.name) private commandeModel: Model<Commande>,
        private packService: PackService
    ) { }

    async addCommande(form: any, user_id: string,session?:ClientSession): Promise<ServiceResponse<Commande>> {
        const { pack_id } = form

        const pack = await this.packService.getPackById(pack_id,session);
        if (!pack.data) {
            throw new NotFoundException("Ce pack est introuvable !");
        }

        if (pack.data.status!=1) {
            throw new ForbiddenException("Ce pack n'est pas disponible !")
        }

        console.log("pack : ",pack.data);
        

        try {
            const commande = await this.commandeModel.create({
                client:user_id,
                packs:[
                    {
                        pack:pack.data,
                        name:pack.data.name,
                        price:pack.data.price,
                        reduction:pack.data.reduction,
                        total:pack.data.total,
                        services:pack.data.details
                    }
                ],
                price:pack.data.price,
                status:0,
                created_at: new Date().toISOString()
            })

            return {
                data: commande,
                message: "Commande créé avec succès !"
            }
        } catch (error) {
            console.error("err",error);
            
            throw new InternalServerErrorException("Problème dans la création du commande !")
        }
    }


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
