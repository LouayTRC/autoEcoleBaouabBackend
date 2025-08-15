import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envSchema } from './validation/env.schema';
import { PermisController } from './crud/permis/permis.controller';
import { PermisModule } from './crud/permis/permis.module';
import { PackModule } from './crud/pack/pack.module';

import { AuthModule } from './crud/auth/auth.module';
import { RoleModule } from './crud/role/role.module';
import { UserModule } from './crud/user/user.module';
import { ServicesModule } from './crud/services/services.module';
import { PackServicesModule } from './crud/pack-services/pack-services.module';


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
    PackModule,
    AuthModule,
    RoleModule,
    UserModule,
    ServicesModule,
    PackServicesModule
  ],
  controllers: [PermisController],
  providers: [],
})
export class AppModule implements NestModule{


  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(AuthenticateMiddleware)
    //   .exclude('auth/*')
    //   .forRoutes('*')
  }
  
}
