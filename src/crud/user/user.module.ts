import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { RoleModule } from 'src/crud/role/role.module';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),RoleModule],
    providers: [UserService,JwtModule],
    exports: [UserService],
    controllers: [UserController]
})


export class UserModule { }
