import { Module } from '@nestjs/common';
import { PackController } from './pack.controller';
import { PackService } from './pack.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, PackSchema } from './pack.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Pack.name, schema:PackSchema }])],
  controllers: [PackController],
  providers: [PackService]
})
export class PackModule {}
