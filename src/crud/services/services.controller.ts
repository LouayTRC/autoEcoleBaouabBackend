import { Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ServiceResponse } from 'src/common/types';
import { Services } from './service.schema';
import { ServicesService } from './services.service';
import { ImageUpload } from 'src/common/decorators';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { TarifService } from '../tarif/tarif.service';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { log } from 'node:console';
import { objectIdSchema } from 'src/validation/objectId.validators';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { Tarif } from '../tarif/tarif.schema';

@Controller('services')
export class ServicesController {

    constructor(
        private serviceService: ServicesService,
        private fileUploadService: FileUploadService,
        private tarifService: TarifService,
        @InjectModel(Services.name) private readonly servicesModel: Model<Services>
    ) { }


    @Post()
    @UseInterceptors(ImageUpload('image'))
    async addService(
        @UploadedFile() file: Express.Multer.File,
        @Body("data") data: any
    ): Promise<ServiceResponse<any>> {
        const form = JSON.parse(data);
        const session = await this.servicesModel.startSession();

        try {
            let result: ServiceResponse<any>;

            await session.withTransaction(async () => {
                // 1️⃣ Créer le service avec ses tarifs
                const createdService = await this.serviceService.createService(form, session);
                
                let updatedService: any = null;

                // 2️⃣ Si une image est uploadée, la sauvegarder et mettre à jour le service
                if (file) {
                    const fileName = await this.fileUploadService.saveFile(file, 'services');
                    updatedService = await this.serviceService.update(
                        createdService.data._id,
                        { image: fileName },
                        session
                    );
                }


                result = {
                    message: createdService.message,
                    data: {
                        ...createdService.data,
                        image: updatedService ? updatedService.data.image : createdService.data.image,
                        tarifs: createdService.data.tarifs || [],
                        ...(createdService.data.errors && { errors: createdService.data.errors })
                    }
                };
            });

            return result!;

        } catch (error) {
            console.log("Erreur addService:", error);
            throw new InternalServerErrorException(
                `Erreur lors de l'ajout du service: ${error.message}`
            );
        } finally {
            await session.endSession();
        }
    }




    @Put(':id')
    @UseInterceptors(ImageUpload('image'))
    async update(
        @Param('id') id: string,
        @Body('data') data: any,
        @UploadedFile() file?: Express.Multer.File
    ): Promise<ServiceResponse<any>> {
        console.log("data",data);
        const form=JSON.parse(data)
        console.log("form",form);
        
        

        const session = await this.servicesModel.db.startSession();

        try {
            let result: ServiceResponse<any>;

            await session.withTransaction(async () => {
                // 1️⃣ Mettre à jour l'image si un fichier est uploadé
                let imageData = {};
                if (file) {
                    const fileName = await this.fileUploadService.saveFile(file, 'services');
                    imageData = { image: fileName };
                }

                // 2️⃣ Mettre à jour le service
                const updatedService = await this.serviceService.update(id, { ...form.service, ...imageData }, session);

               
                
                // 3️⃣ Mettre à jour les tarifs
                let updatedTarifs: any = [];
                if (form.tarifs) {
                    updatedTarifs = await this.tarifService.updateTarifs(id, form.tarifs, session);
                }

                result = {
                    message: "Service mis à jour avec succès",
                    data: {
                        ...updatedService.data,
                        id,
                        tarifs:[...updatedTarifs.data]
                    }
                };
            });

            return result!;
        } catch (error: any) {
            console.log("Erreur updateService:", error);
            throw new InternalServerErrorException(`Erreur lors de la mise à jour du service: ${error.message}`);
        } finally {
            await session.endSession();
        }
    }



    @Get()
    async getAllServices(): Promise<ServiceResponse<Services[]>> {
        return await this.serviceService.getAllServices();
    }

    @Get("permis/:id")
    async getServicesByPermis(@Param("id") id:string):Promise<ServiceResponse<Tarif[]>>{
        return await this.serviceService.getTarifsWithServicesByPermis(id);
    }

    @Get(":id")
    async getServiceById(@Param('id') id: string): Promise<ServiceResponse<Services>> {
        const service = await this.serviceService.getServiceById(id);

        if (!service.data) {
            throw new NotFoundException("Ce Service est introuvable !")
        }

        return {
            data: service.data
        }
    }

    @Delete(':id')
      async delete(
        @Param('id', new JoiValidationPipe(objectIdSchema)) id: string
      ): Promise<ServiceResponse<null>> {
        return await this.serviceService.delete(id);
      }


}
