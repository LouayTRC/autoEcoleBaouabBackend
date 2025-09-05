import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PermisService } from './permis.service';
import { Permis } from './permis.schema';
import { ServiceResponse } from 'src/common/types';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { addPermisSchema } from 'src/validation/requests/permis.validators';
import { objectIdSchema } from 'src/validation/objectId.validators';
import { ImageUpload } from 'src/common/decorators';
import { FileUploadService } from '../fileUpload/fileUpload.service';

@Controller('permis')
export class PermisController {
  constructor(
    private readonly permisService: PermisService, 
    private fileUploadService: FileUploadService
  ) { }

  @Get()
  async getAllPermis(): Promise<ServiceResponse<Permis[]>> {
    return await this.permisService.getAll();
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
    @Body(new JoiValidationPipe(addPermisSchema)) form: any
  ) {
    const createdPermis = await this.permisService.create(form);

    let fileName = '';
    if (file) {
      fileName = await this.fileUploadService.saveFile(file, 'permis');
      const updatedPermis = await this.permisService.update(createdPermis.data.id, { image: fileName });
      return {
        message: createdPermis.message,
        data: updatedPermis.data
      };
    }

    return {
      message: createdPermis.message,
      data: createdPermis.data,
    };
  }

  @Put(':id')
  @UseInterceptors(ImageUpload('image'))
  async update(
    @Param('id', new JoiValidationPipe(objectIdSchema)) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body(new JoiValidationPipe(addPermisSchema)) form: any
  ): Promise<ServiceResponse<Permis>> {
    // Préparer les données de mise à jour
    const updateData: any = {
      name: form.name,
    };

    // Si une nouvelle image est uploadée
    if (file) {
      const fileName = await this.fileUploadService.saveFile(file, 'permis');
      updateData.image = fileName;
    }

    return await this.permisService.update(id, updateData);
  }

  @Delete(':id')
  async delete(
    @Param('id', new JoiValidationPipe(objectIdSchema)) id: string
  ): Promise<ServiceResponse<null>> {
    return await this.permisService.delete(id);
  }
}