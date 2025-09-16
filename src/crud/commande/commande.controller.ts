import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { Roles, ServiceResponse } from 'src/common/types';
import { Commande } from './commande.schema';

import { RolesDecorator } from 'src/common/decorators';
import path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { createClientNewCommandeMail, createOwnerNewCommandeMail } from 'src/common/emails';
import { NotFoundError } from 'rxjs';
import { EmailService } from '../email/email.service';

@Controller('commande')
// @UseGuards(RoleGuard)
export class CommandeController {

    constructor(
        @InjectModel(Commande.name) private commandeModel:Model<Commande>,
        private commandeService: CommandeService,
        private userService:UserService,
        private emailService:EmailService
    ) { }

    @Post()
    // @RolesDecorator(Roles.client)
    async addCommande(@Req() req: Request, @Body() form: any): Promise<ServiceResponse<Commande>> {
        const user_id = req["user_id"]
        let result:ServiceResponse<Commande>;

        const user=await this.userService.getUserById(user_id);
        if (!user.data) {
            throw new NotFoundException("L'utilisateur est introuvable !!")
        }
        

        const session=await this.commandeModel.db.startSession();

        await session.withTransaction(async ()=>{
            const addCommandeResult=await this.commandeService.addCommande(form, user_id,session);

            if (addCommandeResult.data) {
                const newCommandeClientEmail=createClientNewCommandeMail(addCommandeResult.data,user.data!.email)
                await this.emailService.sendMail(newCommandeClientEmail.subject,newCommandeClientEmail.html,undefined,newCommandeClientEmail.to)
                const newCommandeOwnerEmail=createOwnerNewCommandeMail(addCommandeResult.data,user.data!.email)
                await this.emailService.sendMail(newCommandeOwnerEmail.subject,newCommandeOwnerEmail.html)
            }   
            
            result={
                data:addCommandeResult.data,
                message:addCommandeResult.message
            }

            

        })
        return result!;
    }

    // @Get("client")
    // @RolesDecorator(Roles.user)
    // async getClientCommands(@Req() req: Request): Promise<ServiceResponse<Commande[]>> {
    //     const user_id = req["user_id"]
    //     return await this.commandeService.getClientCommands(user_id);
    // }

    // @Get()
    // async getAllCommands(): Promise<ServiceResponse<Commande[]>> {
    //     const relations=[
    //         {
    //             path:"packs",
    //             childs:[
    //                 {path:"pack_id"}
    //             ]
    //         }
    //     ]
    //     return await this.commandeService.getAllCommands(relations);
    // }
}
