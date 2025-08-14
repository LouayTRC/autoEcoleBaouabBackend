import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { PermisService } from './permis.service';
import { Permis } from './permis.schema';
import { ServiceResponse } from 'src/common/types';

@Controller('permis')
export class PermisController {
  constructor(private readonly permisService: PermisService) {}

  @Get()
  async getAll(): Promise<ServiceResponse<Permis[]>> {
    return this.permisService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ServiceResponse<Permis | null>> {
    return this.permisService.getPermisById(id);
  }

  @Post()
  async create(
    @Body() form: { type: string },
  ): Promise<ServiceResponse<Permis | null>> {

    const existsResponse = await this.permisService.findByType(form.type);

    // if (existsResponse.success && existsResponse.data) {
    //   return {
    //     success:false,
    //     data:null,
    //     message:"Ce permis existe déja",
    //     errorCode:404
    //   }
    // }
    const createResponse = await this.permisService.create(form);

    return createResponse
  }
}
