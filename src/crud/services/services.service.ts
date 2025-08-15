import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Services } from './service.schema';
import { Model } from 'mongoose';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class ServicesService {

    constructor(
        @InjectModel(Services.name) private serviceModel:Model<Services>,
    ) { }


    async addService(form:any):Promise<ServiceResponse<Services>>{
        const {name}=form;

        const existingService=await this.getServiceByName(name);
        if (existingService.data) {
            throw new ConflictException("Ce service existe déja !")
        }

        try {
            const newService=await this.serviceModel.create({
                name
            })
            return {
                data:newService,
                message:"Service créé avec succès"
            }

        } catch (error) {
            throw new InternalServerErrorException("Problème dans la création du Service !")
        }
    }
    
    async getAllServices():Promise<ServiceResponse<Services[]>>{
        const services= await this.serviceModel.find().exec()
        return {
            data:services
        }
    }
    
    async getServiceById(id:string):Promise<ServiceResponse<Services | null>>{
        const service=await this.serviceModel.findById(id).exec();
        return {
            data:service
        }
    }

     async getServiceByName(name:string):Promise<ServiceResponse<Services | null>>{
        const service=await this.serviceModel.findOne({name}).exec();
        return {
            data:service
        }
    }

}
