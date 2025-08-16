import { Module } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Commande, CommandeSchema } from './commande.schema';
import { UserModule } from '../user/user.module';
import { PackModule } from '../pack/pack.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Commande.name,schema:CommandeSchema}]),
    UserModule,
    PackModule,
    RoleModule
  ],
  providers: [CommandeService],
  controllers: [CommandeController]
})
export class CommandeModule {}
