import { Controller, Get, Post } from '@nestjs/common';
import { ServiceResponse } from 'src/common/types';
import { Pack } from './pack.schema';
import { PackService } from './pack.service';

@Controller('pack')
export class PackController {

    constructor(private packService:PackService){}

    @Post()
    async addPack(form:any):Promise<ServiceResponse<Pack>>{
        return await this.packService.addPack(form)
    }

    @Get()
    async getAllPacks():Promise<ServiceResponse<Pack[]>>{
        return await this.packService.getAllPacks();
    }

    @Get(':permis_id')
    async getPacksByPermisId(id:string):Promise<ServiceResponse<Pack[]>>{
        return await this.packService.getPacksByPermisId(id);
    }
}
