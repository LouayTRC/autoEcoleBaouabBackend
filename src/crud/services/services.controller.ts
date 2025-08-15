import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ServiceResponse } from 'src/common/types';
import { Services } from './service.schema';
import { ServicesService } from './services.service';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { addServiceSchema } from 'src/validation/requests/services.validators';

@Controller('services')
export class ServicesController {

    constructor(private serviceService:ServicesService){}


    @Post()
    async addService(@Body(new JoiValidationPipe(addServiceSchema)) form:any):Promise<ServiceResponse<Services>>{
        return await this.serviceService.addService(form);
    }
    
    
    @Get()
    async getAllServices():Promise<ServiceResponse<Services[]>>{
        return await this.serviceService.getAllServices();
    }

    @Get(":id")
    async getServiceById(@Param('id') id:string):Promise<ServiceResponse<Services>>{
        const service=await this.serviceService.getServiceById(id);

        if (!service.data) {
            throw new NotFoundException("Ce Service est introuvable !")
        }

        return {
            data:service.data
        }
    }
}
