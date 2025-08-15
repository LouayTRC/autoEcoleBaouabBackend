import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { PermisService } from './permis.service';
import { Permis } from './permis.schema';
import { ServiceResponse } from 'src/common/types';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { addPermisSchema } from 'src/validation/requests/permis.validators';
import { objectIdSchema } from 'src/validation/objectId.validators';

@Controller('permis')
export class PermisController {
  constructor(private readonly permisService: PermisService) {}

  @Get()
  async getAllPermis(): Promise<ServiceResponse<Permis[]>> {
    return await this.permisService.getAll();
  }

  @Get(':id')
  async getPermisById(@Param('id',new JoiValidationPipe(objectIdSchema)) id: string): Promise<ServiceResponse<Permis | null>> {

    const permis=await this.permisService.getPermisById(id);
    if (!permis.data) {
      throw new NotFoundException("Ce permis est introuvable !")
    }

    return {
      data:permis.data
    }
  }

  @Post()
  async create(@Body(new JoiValidationPipe(addPermisSchema)) form:any): Promise<ServiceResponse<Permis>> {
    return await this.permisService.create(form);
  }


}
