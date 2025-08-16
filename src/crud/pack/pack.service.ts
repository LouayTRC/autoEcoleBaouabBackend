import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pack } from './pack.schema';
import { Model } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';
import { PermisService } from '../permis/permis.service';
import { PackServicesService } from '../pack-services/pack-services.service';
import path from 'path';

@Injectable()
export class PackService {

    constructor(
        @InjectModel(Pack.name) private packModel: Model<Pack>,
        @Inject(forwardRef(() => PackServicesService)) private packServicesService: PackServicesService,
        private permisService: PermisService
    ) { }

    async addPack(form: any): Promise<ServiceResponse<Pack>> {
        const { permis_id, name, price, packServices } = form

        const permis = await this.permisService.getPermisById(permis_id);
        if (!permis.data) {
            throw new NotFoundException("Ce permis est introuvable !")
        }

        // const existingPack=await this.getPackByPermisAndName(permis_id,name)
        // if (existingPack.data) {
        //     throw new ConflictException("Un pack avec le mémé nom pour le meme permis est trouvé !")
        // }

        let newPack
        try {
            newPack = await this.packModel.create({
                permis: permis.data,
                name,
                price
            })
        } catch (error) {
            throw new InternalServerErrorException("Problème dans la création du pack !")
        }


        for (const ps of packServices) {
            await this.packServicesService.addPackService(ps, newPack._id.toString())
        }

        return {
            data: newPack,
            message: "Pack créé avec succès"
        }

    }

    async getAllPacks(relations?: any[]): Promise<ServiceResponse<Pack[]>> {
        let populateConfig = relations ? buildPopulateConfig(relations) : [];

        let query = this.packModel.find();
        if (populateConfig.length > 0) {
            query=query.populate(populateConfig)
        }

        const packs = await query.exec()
        return {
            data: packs
        }
    }

    async getPacksByPermisId(id: string): Promise<ServiceResponse<Pack[]>> {
        const permis = await this.permisService.getPermisById(id);
        if (!permis.data) {
            throw new NotFoundException("Ce permis est introuvable !")
        }

        const packs = await this.packModel.find({ permis: id }).exec()
        return {
            data: packs
        }
    }

    async getPackById(id: string): Promise<ServiceResponse<Pack | null>> {
        const pack = await this.packModel.findById(id).exec()
        return {
            data: pack
        }
    }

    // async getPackByPermisAndName(permis_id:string,name:string):Promise<ServiceResponse<Pack| null>>{
    //     const pack=await this.packModel.findOne({permis:permis_id,name}).exec()
    //     return {
    //         data:pack
    //     }
    // }

}
