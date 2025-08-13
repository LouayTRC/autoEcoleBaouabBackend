import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles, ServiceResponse } from 'src/common/types';
import { User } from './user.schema';
import { RoleGuard } from 'src/guards/roles.guard';
import { RolesDecorator } from 'src/common/decorators';


@Controller('user')
@UseGuards(RoleGuard)
export class UserController {

    constructor(private userService:UserService){}

    @Get()
    @RolesDecorator(Roles.admin)
    async getAllUsers():Promise<ServiceResponse<User[]>>{
        return await this.userService.getAllUsers()
    }


    
}
