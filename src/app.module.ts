import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envSchema } from './validation/env.schema';
import { PermisController } from './permis/permis.controller';
import { PermisModule } from './permis/permis.module';
import { PackModule } from './pack/pack.module';
import { ServicesModule } from './services/services.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';


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
    ServicesModule,
    AuthModule,
    RoleModule,
    UserModule
  ],
  controllers: [PermisController],
  providers: [],
})
export class AppModule {}
