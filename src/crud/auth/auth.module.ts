import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleModule } from 'src/crud/role/role.module';
import { UserModule } from 'src/crud/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Module({
    imports:[
        UserModule,
        RoleModule,
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory: (configService:ConfigService)=>({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {expiresIn:configService.get<string>("JWT_EXPIRES_IN")}
            })
        })
    ],
    providers:[AuthService],
    exports:[AuthService,JwtModule],
    controllers:[AuthController]
})
export class AuthModule {}
