import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { UserModule } from '../user/user.module';

import { RoleModule } from '../role/role.module';
import { PackModule } from '../pack/pack.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Order.name,schema:OrderSchema}]),
    UserModule,
    RoleModule,
    PackModule,
    EmailModule
  ],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
