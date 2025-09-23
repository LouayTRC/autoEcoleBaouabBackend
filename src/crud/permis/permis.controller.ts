import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PermisService } from './permis.service';
import { Permis } from './permis.schema';
import { ServiceResponse } from 'src/common/types';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { addPermisSchema } from 'src/validation/requests/permis.validators';
import { objectIdSchema } from 'src/validation/objectId.validators';
import { ImageUpload } from 'src/common/decorators';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { Tarif } from '../tarif/tarif.schema';
import { TarifService } from '../tarif/tarif.service';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

@Controller('permis')
export class PermisController {
  constructor(
    private readonly permisService: PermisService,
    private readonly tarifsService: TarifService,
    private fileUploadService: FileUploadService
  ) { }

  @Get()
  async getAllPermis(): Promise<ServiceResponse<Permis[]>> {
    const relations = [
      {
        path: "tarifs",
        childs: [{
          path: "service"
        }]
      }
    ]

    
    return await this.permisService.getAll(relations);
  }

  @Get(':id')
  async getPermisById(@Param('id', new JoiValidationPipe(objectIdSchema)) id: string): Promise<ServiceResponse<Permis | null>> {
    const permis = await this.permisService.getPermisById(id);
    if (!permis.data) {
      throw new NotFoundException("Ce permis est introuvable !")
    }

    return {
      data: permis.data
    }
  }

  @Post()
  @UseInterceptors(ImageUpload('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() form: any
  ) {
    const data = JSON.parse(form.data)

    const session = await this.permisService.startSession()

    let response;
    await session.withTransaction(async () => {
      const createdPermis = await this.permisService.create(data, session);

      if (data.tarifs && data.tarifs.length > 0) {
        const addTarifsResult = await this.tarifsService.addTarifsForPermis(createdPermis.data.id, data.tarifs, session)
        response = {
          data: { ...createdPermis.data, tarifs: addTarifsResult.data.tarifs },
          message: createdPermis.message,
        }
      }
      else {
        response = {
          data: { ...createdPermis.data, tarifs: [] },
          message: createdPermis.message,
        }
      }


      let fileName = '';
      if (file) {
        fileName = await this.fileUploadService.saveFile(file, 'permis');
        const updatedPermis = await this.permisService.update(createdPermis.data.id, { image: fileName }, session);
        response = {
          ...response,
          data: { ...response.data, image: updatedPermis.data.image },
        };
      }

      return response
    })

    return response!;
  }

  @Put(':id')
  @UseInterceptors(ImageUpload('image'))
  async update(
    @Param('id', new JoiValidationPipe(objectIdSchema)) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ): Promise<ServiceResponse<any>> {

    const form = JSON.parse(body.data);


    // Démarrer la session ici
    const session = await this.permisService.startSession();
    let response;

    try {
      await session.withTransaction(async () => {

        // 1️⃣ Update du nom du permis
        const updatedPermis = await this.permisService.update(id, { name: form.name }, session);

        // 2️⃣ Update des tarifs
        let updatedTarifs: any = [];
        if (form.tarifs?.length) {
          updatedTarifs = await this.tarifsService.updateTarifsForPermis(id, form.tarifs, session);
        }

        // 3️⃣ Upload image
        if (file) {
          const fileName = await this.fileUploadService.saveFile(file, 'permis');
          const permisWithImage = await this.permisService.update(id, { image: fileName }, session);
          updatedPermis.data.image = permisWithImage.data.image;
        }

        response = {
          data: { ...updatedPermis.data.toObject(), tarifs: updatedTarifs.data },
          message: "Permis mis à jour avec succès"
        };
      });

      return response;
    } catch (err) {
      throw err; // rollback automatique
    } finally {
      session.endSession();
    }
  }



  @Delete(':id')
  async delete(
    @Param('id', new JoiValidationPipe(objectIdSchema)) id: string
  ): Promise<ServiceResponse<null>> {
    return await this.permisService.delete(id);
  }
}