import { Body, ConflictException, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Roles, ServiceResponse } from 'src/common/types';
import { Role } from './role.schema';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { addRoleSchema } from 'src/validation/requests/role.validators';

import { RolesDecorator } from 'src/common/decorators';

@Controller('role')
// @UseGuards(RoleGuard)
export class RoleController {

    constructor(private readonly roleService: RoleService) { }

    @Post()
    // @RolesDecorator(Roles.admin)
    async create(@Body(new JoiValidationPipe(addRoleSchema)) form: any): Promise<ServiceResponse<Role | null>> {
        return await this.roleService.create(form);
    }

    @Get()
    async getAllRoles(): Promise<ServiceResponse<Role[]>> {
        return await this.roleService.getRoles()
    }

    @Get(":role_id")
    async getRoleById(@Param("role_id") id:string): Promise<ServiceResponse<Role>> {
        const role= await this.roleService.getRoleById(id)
        if (!role.data) {
            throw new NotFoundException("Ce Role est introuvable !")
        }

        return {
            data:role.data
        }
    }
}
