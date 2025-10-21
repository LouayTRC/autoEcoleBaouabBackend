import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { Roles, ServiceResponse } from 'src/common/types';
import { EmailService } from './email.service';
import { AuthenticateGuard } from 'src/guards/authenticate.guard';
import { RolesDecorator } from 'src/common/decorators';

@Controller('email')
export class EmailController {

    constructor(private emailService:EmailService){}

    @Post()
    async contactUs(@Body() form:any):Promise<ServiceResponse<any>>{
        const {from,subject,message}=form
        return await this.emailService.sendContactEmail(from,subject,message);
    }

    @Get()
    @UseGuards(AuthenticateGuard)
    @RolesDecorator(Roles.admin)
    async getAllContactUsEmails():Promise<ServiceResponse<any[]>>{
        return await this.emailService.getAllContactUsEmails();
    }


    @Put()
    @UseGuards(AuthenticateGuard)
    @RolesDecorator(Roles.admin)
    async updateContactUsEmail(@Body() form:any):Promise<ServiceResponse<any>>{
        const {id,status}=form
        return await this.emailService.updateContactUsEmail(id,status);
    }
}
