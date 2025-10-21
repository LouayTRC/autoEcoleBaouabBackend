import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleModule } from 'src/crud/role/role.module';
import { UserModule } from 'src/crud/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/strategies/local.strategy';
import { LoginValidationMiddleware } from 'src/middlewares/loginValidation.middleware';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { FacebookStrategy } from 'src/strategies/facebook.strategy';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        forwardRef(() => EmailModule),
        UserModule,
        RoleModule,
        PassportModule.register({ session: false }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("ACCESS_JWT_SECRET"),
                signOptions: { expiresIn: configService.get<string>("ACCESS_JWT_EXPIRES_IN") }
            })
        })
    ],
    providers: [AuthService, LocalStrategy, GoogleStrategy, FacebookStrategy],
    exports: [AuthService, JwtModule],
    controllers: [AuthController]
})
export class AuthModule implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoginValidationMiddleware)
            .forRoutes('auth/login');
    }

}
