import { Body, ConflictException, Controller, Get, InternalServerErrorException, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { ServiceResponse } from 'src/common/types';
import { Role } from './role.schema';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { addRoleSchema } from 'src/validation/requests/role.validators';

@Controller('role')
export class RoleController {

    constructor(private readonly roleService: RoleService) { }

    @Post()
    async create(@Body(new JoiValidationPipe(addRoleSchema)) form: any): Promise<ServiceResponse<Role | null>> {
        return await this.roleService.create(form);
    }

    @Get()
    async getAllRoles(): Promise<ServiceResponse<Role[]>> {
        return await this.roleService.getRoles()
    }
}
