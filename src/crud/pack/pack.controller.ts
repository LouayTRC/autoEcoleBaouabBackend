import { Body, Controller, Get, Post } from '@nestjs/common';
import { PackService } from './pack.service';
import { ServiceResponse } from 'src/common/types';
import { Pack } from './pack.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface addPackDTO{
    name:string;
    description:string;
    permis_id:string;
    services:{
        serviceName:string,
        qte:number
    }[],
    reduction:number;
    price:number
}


@Controller('pack')
export class PackController {

    constructor(
        @InjectModel(Pack.name) private readonly packModel: Model<Pack>,
        private packService: PackService
    ) { }

    @Post()
    async addPack(@Body() form: any): Promise<ServiceResponse<Pack>> {

        let result:ServiceResponse<Pack>

        const session = await this.packModel.db.startSession();

        await session.withTransaction(async () => {
            const newPack = await this.packService.addPack(form,session);
            result={
                message:newPack.message,
                data:newPack.data
            }
        })
        return result!;
    }


    @Get()
    async getAllPacks(): Promise<ServiceResponse<Pack[]>> {
        return await this.packService.getAllPacks()
    }





}
