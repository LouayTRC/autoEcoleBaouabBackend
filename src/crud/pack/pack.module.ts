import { forwardRef, Module } from '@nestjs/common';
import { PackController } from './pack.controller';
import { PackService } from './pack.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, PackSchema } from './pack.schema';
import { PermisService } from '../permis/permis.service';
import { PermisModule } from '../permis/permis.module';
import { PackServicesModule } from '../pack-services/pack-services.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Pack.name, schema:PackSchema }]),
    PermisModule,
    forwardRef(()=>PackServicesModule)
  ],
  controllers: [PackController],
  providers: [PackService],
  exports:[PackService]
})
export class PackModule {}
