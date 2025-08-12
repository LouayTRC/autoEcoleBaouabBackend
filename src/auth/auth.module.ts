import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
    imports:[
        UserModule,
        RoleModule,
        // JwtModule.register({
        //     secret:
        // })
    ],
    providers:[AuthService,JwtModule],
    exports:[AuthService]
})
export class AuthModule {}
