import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permis, PermisSchema } from './permis.schema';
import { PermisController } from './permis.controller';
import { PermisService } from './permis.service';

@Module({
    imports:[MongooseModule.forFeature([{name:Permis.name,schema:PermisSchema}])],
    controllers:[PermisController],
    providers:[PermisService],
    exports:[PermisService],
})
export class PermisModule {}
