import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Tarif, TarifDocument } from './tarif.schema';
import { ServicesService } from '../services/services.service';
import { PermisService } from '../permis/permis.service';
import { ServiceResponse } from 'src/common/types';


@Injectable()
export class TarifService {

    constructor(
        @InjectModel(Tarif.name) private tarifModel: Model<TarifDocument>,
        @Inject(forwardRef(() => ServicesService)) private readonly servicesService: ServicesService,
        @Inject(forwardRef(() => PermisService)) private readonly permisService: PermisService,
    ) { }


    async addTarifs(
        service_id: string,
        tarifs: any[],
        session: ClientSession, // session obligatoire
    ): Promise<ServiceResponse<any>> {



        const getService = await this.servicesService.getServiceById(service_id,session);
        if (!getService.data) {
            console.log("lena");
            
            throw new NotFoundException("Ce Service est introuvable !");
        }

        const createdTarifs: Tarif[] = [];
        const errors: string[] = [];

        for (const tarifItem of tarifs) {
            const getPermis = await this.permisService.getPermisByName(tarifItem.permisName);

            if (!getPermis.data) {
                // Ajouter à la liste des erreurs mais continuer
                errors.push(`Le permis ${tarifItem.permisName} est introuvable !`);
                continue;
            }

            // Vérifier si le tarif existe déjà
            const existingTarif = await this.tarifModel.findOne({
                permis: getPermis.data._id,
                service: getService.data._id
            }).session(session);

            if (existingTarif) {
                existingTarif.price = tarifItem.price;
                const updatedTarif = await existingTarif.save({ session });
                createdTarifs.push(updatedTarif);
            } else {
                const newTarif = await this.tarifModel.create([{
                    permis: getPermis.data,
                    service: getService.data._id,
                    price: tarifItem.price,
                    image: 'permis/allPermis.jpeg'
                }], { session });

                createdTarifs.push(newTarif[0]);
            }
        }

        // Après la boucle : si aucun tarif n’a été créé, lever une exception
        if (createdTarifs.length === 0) {
            throw new BadRequestException(
                `Aucun tarif n'a pu être créé. Erreurs: ${errors.join(', ')}`
            );
        }

        return {
            data: {
                tarifs: createdTarifs,
                ...(errors.length > 0 && { errors })
            },
            message: `Tarifs créés avec succès`
        };
    }


   async updateTarifs(
    service_id: string,
    tarifs: any[],
    session: ClientSession
): Promise<ServiceResponse<any>> {
    console.log("ser", service_id);
    
    const getService = await this.servicesService.getServiceById(service_id, session);
    if (!getService.data) {
        throw new NotFoundException("Ce Service est introuvable !");
    }

    console.log("tarifs", tarifs);

    // 1. Récupérer tous les tarifs existants du service
    const existingTarifs = await this.tarifModel.find({
        service: getService.data._id
    }).populate('permis').session(session);

    // 2. Supprimer les tarifs qui ne sont pas dans la nouvelle liste
    const tarifsToDelete = existingTarifs.filter(existingTarif => 
        !tarifs.some(tarif => existingTarif.permis.name === tarif.permisName)
    );

    if (tarifsToDelete.length > 0) {
        const deleteIds = tarifsToDelete.map(tarif => tarif._id);
        await this.tarifModel.deleteMany({
            _id: { $in: deleteIds }
        }).session(session);
    }

    // 3. Mettre à jour les tarifs existants
    const tarifsToUpdate = existingTarifs.filter(existingTarif => 
        tarifs.some(tarif => existingTarif.permis.name === tarif.permisName)
    );

    for (const existingTarif of tarifsToUpdate) {
        const newTarifData = tarifs.find(tarif => existingTarif.permis.name === tarif.permisName);
        existingTarif.price = newTarifData.price;
        await existingTarif.save({ session });
    }

    // 4. Créer les nouveaux tarifs
    const tarifsToCreate = tarifs.filter(tarif => 
        !existingTarifs.some(existingTarif => existingTarif.permis.name === tarif.permisName)
    );

    const newTarifs:Tarif[] = [];
    for (const tarifItem of tarifsToCreate) {
        const getPermis = await this.permisService.getPermisByName(tarifItem.permisName);
        
        if (getPermis.data) {
            const newTarif = await this.tarifModel.create([{
                permis: getPermis.data._id,
                service: getService.data._id,
                price: tarifItem.price,
                image: 'permis/allPermis.jpeg'
            }], { session });

            newTarifs.push(newTarif[0]);
        }
    }

    // 5. Récupérer tous les tarifs finaux du service
    const finalTarifs = await this.tarifModel.find({
        service: getService.data._id
    }).populate('permis').session(session);

    return {
        data: finalTarifs,
        message: `Tarifs mis à jour avec succès`
    };
}


}