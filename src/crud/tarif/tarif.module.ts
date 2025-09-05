import { forwardRef, Module } from '@nestjs/common';
import { TarifService } from './tarif.service';
import { TarifController } from './tarif.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tarif, TarifSchema } from './tarif.schema';
import { PermisModule } from '../permis/permis.module';
import { PermisService } from '../permis/permis.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Tarif.name,schema:TarifSchema}]),
    forwardRef(()=>PermisModule),
    forwardRef(()=>ServicesModule)
  ],
  providers: [TarifService],
  controllers: [TarifController],
  exports:[TarifService]
})
export class TarifModule {}
