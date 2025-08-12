import { Module } from '@nestjs/common';
import { PackController } from './pack.controller';
import { PackService } from './pack.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[MongooseModule.forFeature([{name: }])],
  controllers: [PackController],
  providers: [PackService]
})
export class PackModule {}
