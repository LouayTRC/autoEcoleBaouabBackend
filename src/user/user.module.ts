import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { RoleModule } from 'src/role/role.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),RoleModule],
    providers: [UserService],
    exports: [
        UserService
    ]
})


export class UserModule { }
