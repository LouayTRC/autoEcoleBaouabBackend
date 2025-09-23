import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ServiceResponse } from 'src/common/types';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {

    constructor(private emailService:EmailService){}

    @Post()
    async contactUs(@Body() form:any):Promise<ServiceResponse<any>>{
        const {from,subject,message}=form
        return await this.emailService.sendContactEmail(from,subject,message);
    }

    @Get()
    async getAllContactUsEmails():Promise<ServiceResponse<any[]>>{
        return await this.emailService.getAllContactUsEmails();
    }


    @Put()
    async updateContactUsEmail(@Body() form:any):Promise<ServiceResponse<any>>{
        const {id,status}=form
        return await this.emailService.updateContactUsEmail(id,status);
    }
}
