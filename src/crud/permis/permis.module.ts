import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permis, PermisSchema } from './permis.schema';
import { PermisController } from './permis.controller';
import { PermisService } from './permis.service';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { FileUploadModule } from '../fileUpload/fileUpload.module';
import { TarifModule } from '../tarif/tarif.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Permis.name, schema: PermisSchema }]),
        forwardRef(() => TarifModule),
        FileUploadModule,
    ],
    controllers: [PermisController],
    providers: [PermisService],
    exports: [PermisService],
})
export class PermisModule { }
