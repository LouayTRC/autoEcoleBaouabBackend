import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, PackSchema } from './pack.schema';
import { PackService } from './pack.service';
import { PermisModule } from '../permis/permis.module';
import { PackController } from './pack.controller';
import { ServicesModule } from '../services/services.module';
import { FileUploadModule } from '../fileUpload/fileUpload.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Pack.name, schema: PackSchema }]),
        PermisModule,
        ServicesModule,
        FileUploadModule
    ],
    providers: [PackService],
    exports: [PackService],
    controllers: [PackController]
})
export class PackModule { }
