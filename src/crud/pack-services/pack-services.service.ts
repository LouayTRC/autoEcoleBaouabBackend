import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';
import { ServicesService } from '../services/services.service';
import { PackService } from '../pack/pack.service';
import { PackServices } from './pack-services.schema';

@Injectable()
export class PackServicesService {

    constructor(
        @InjectModel(PackServices.name) private packServiceModel: Model<PackServices>,
        @Inject(forwardRef(()=>PackService)) private packService:PackService,
        private servicesService:ServicesService,
    ) { }

    // async getServicesByPackId(id:string):Promise<ServiceResponse<PackService[]>>{
    //     const pack=this.packService.get
    // }

    async addPackService(form:any):Promise<ServiceResponse<PackServices>>{
        const {pack_id,service_id,hours}=form

        const pack=await this.packService.getPackById(pack_id);
        if (!pack.data) {
            throw new NotFoundException("Pack introuvable !!")
        }

        const service=await this.servicesService.getServiceById(service_id);
        if (!service.data) {
            throw new NotFoundException("Service introuvable !!")
        }

        try {
            const newPackService=await this.packServiceModel.create({
                service:service.data,
                pack:pack.data,
                hours
            })

            return {
                data:newPackService,
                message:"Service ajouté au pack avec succès !"
            }
        } catch (error) {
            throw new InternalServerErrorException("Problème dans l'ajout du service au pack !")
        }
    }

}
