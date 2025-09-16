import { Body, Controller, Post } from '@nestjs/common';
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
}
