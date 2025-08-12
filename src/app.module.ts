import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envSchema } from './validation/env.schema';
import { PermisController } from './permis/permis.controller';
import { PermisModule } from './permis/permis.module';
import { PackModule } from './pack/pack.module';


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
    PackModule
  ],
  controllers: [PermisController],
  providers: [],
})
export class AppModule {}
