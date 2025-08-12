import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { ServiceResponse } from 'src/common/types';
import { Role } from './role.schema';

@Controller('role')
export class RoleController {

    constructor(private readonly roleService:RoleService){}

    @Post()
    async create(@Body() form:any):Promise<ServiceResponse<Role | null>>{
        try {
            
            const existingRole=await this.roleService.getRoleByName(form.name);

            if (!existingRole.data && !existingRole.success) {
                return await this.roleService.create(form);
            }

            return existingRole;
        } catch (error) {
            return {
                success:false,
                data:null,
                message: error.message || "Problème dans la création du role",
                errorCode: 500
            }
        }
    }

    @Get()
    async getAllRoles():Promise<ServiceResponse<Role[]>>{
        return await this.roleService.getRoles()
    }
}
