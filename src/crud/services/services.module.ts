import { forwardRef, Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Services, ServicesSchema } from './services.schema';
import { TarifModule } from '../tarif/tarif.module';
import { FileUploadModule } from '../fileUpload/fileUpload.module';
import { PermisModule } from '../permis/permis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[
    AuthModule,
    forwardRef(()=>TarifModule),
    FileUploadModule,
    MongooseModule.forFeature([{name:Services.name,schema:ServicesSchema}])
  ],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports:[ServicesService]
})
export class ServicesModule {}
