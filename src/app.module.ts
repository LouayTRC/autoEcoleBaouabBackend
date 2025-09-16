import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envSchema } from './validation/env.schema';
import { PermisController } from './crud/permis/permis.controller';
import { PermisModule } from './crud/permis/permis.module';

import { AuthModule } from './crud/auth/auth.module';
import { RoleModule } from './crud/role/role.module';
import { UserModule } from './crud/user/user.module';
import { ServicesModule } from './crud/services/services.module';
import { CommandeModule } from './crud/commande/commande.module';
import { AuthenticateMiddleware } from './middlewares/authenticate.middleware';
import { FileUploadModule } from './crud/fileUpload/fileUpload.module';
import { TarifModule } from './crud/tarif/tarif.module';
import { PackModule } from './crud/pack/pack.module';
import { EmailModule } from './crud/email/email.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      validationSchema:envSchema
    }),
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: async(configService:ConfigService)=>({
        uri:configService.get<string>('MONGO_URI')
      })
    }),
    PermisModule,
    AuthModule,
    RoleModule,
    UserModule,
    ServicesModule,
    CommandeModule,
    FileUploadModule,
    TarifModule,
    PackModule,
    EmailModule
  ],
  controllers: [PermisController],
  providers: [],
})
export class AppModule implements NestModule{


  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateMiddleware)
      .exclude('auth/*')
      .forRoutes('*')
  }
  
}
