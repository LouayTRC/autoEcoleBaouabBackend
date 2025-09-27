import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles, ServiceResponse } from 'src/common/types';
import { User } from './user.schema';
import { RolesDecorator } from 'src/common/decorators';


@Controller('user')
// @UseGuards(RoleGuard)
export class UserController {

    constructor(private userService:UserService){}

    @Post()
    // @RolesDecorator(Roles.admin)
    async getAllUsers(@Body() params:any):Promise<ServiceResponse<User[]>>{
        return await this.userService.getAllUsers(params)
    }


    @Get(":id")
    // @RolesDecorator(Roles.admin)
    async getUserById(@Param("id") id:string):Promise<ServiceResponse<User | null>>{
        const relations=[
            {
                path:"orders",
            }
        ]
        
        return await this.userService.getUserById(id,relations)
    }


    @Put('status')
    async updateUserStatus(@Body() form:any):Promise<ServiceResponse<User>>{
        return await this.userService.updateUser(form.id,form)
    }


    @Put('pwd')
    async changeUserPwd(@Body() form:any):Promise<ServiceResponse<null>>{
        return await this.userService.changePwd(form)
    }

    
}
