import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PackService } from './pack.service';
import { ServiceResponse } from 'src/common/types';
import { Pack } from './pack.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImageUpload } from 'src/common/decorators';
import { FileUploadService } from '../fileUpload/fileUpload.service';

interface addPackDTO {
    name: string;
    description: string;
    permis_id: string;
    services: {
        serviceName: string,
        qte: number
    }[],
    reduction: number;
    price: number
}


@Controller('pack')
export class PackController {

    constructor(
        @InjectModel(Pack.name) private readonly packModel: Model<Pack>,
        private packService: PackService,
        private fileUploadService:FileUploadService
    ) { }

    // @Post()
    // @UseInterceptors(ImageUpload("image"))
    // async addPack(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Body('data') data: any
    // ): Promise<ServiceResponse<Pack>> {

    //     const body = JSON.parse(data);
    //     let result: ServiceResponse<Pack>

    //     const session = await this.packModel.db.startSession();

    //     await session.withTransaction(async () => {
    //         const newPack = await this.packService.addPack(body, session);
    //         result = {
    //             message: newPack.message,
    //             data: newPack.data
    //         }

    //         let fileName = '';
    //         if (file) {
    //             fileName = await this.fileUploadService.saveFile(file, 'packs');
    //             const updatedPermis = await this.packService.updatePack(newPack.data.id, { image: fileName }, session);
    //             result = {
    //                 ...result,
    //                 data: { ...result.data, image: updatedPermis.data.image },
    //             };
    //         }

    //     })
    //     return result!;
    // }


    // @Get(':status')
    // async getAllPacks(@Param("status") status?:number): Promise<ServiceResponse<Pack[]>> {
    //     const statusFilter= status ? Number(status) : undefined
    //     return await this.packService.getAllPacks(statusFilter)
    // }


    // @Put("status")
    // async updatePackStatus(@Body() form:any): Promise<ServiceResponse<Pack>> {
    //     const payload={
    //         status:form.status
    //     }
    //     return await this.packService.updatePack(form.pack_id,payload)
    // }




}
