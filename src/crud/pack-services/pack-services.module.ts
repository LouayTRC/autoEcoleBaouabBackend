import { forwardRef, Module } from '@nestjs/common';
import { PackServicesService } from './pack-services.service';
import { PackServicesController } from './pack-services.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { PackServices, PackServicesSchema } from './pack-services.schema';
import { PackModule } from '../pack/pack.module';
import { PermisModule } from '../permis/permis.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PackServices.name, schema: PackServicesSchema }]),
    ServicesModule,
    forwardRef(()=>PackModule)
  ],
  providers: [PackServicesService],
  controllers: [PackServicesController],
  exports:[PackServicesService]
})
export class PackServicesModule { }
