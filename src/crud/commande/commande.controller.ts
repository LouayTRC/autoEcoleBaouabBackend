import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { Roles, ServiceResponse } from 'src/common/types';
import { Commande } from './commande.schema';

import { RolesDecorator } from 'src/common/decorators';
import path from 'path';

@Controller('commande')
// @UseGuards(RoleGuard)
export class CommandeController {

    constructor(private commandeService: CommandeService) { }

    // @Post()
    // @RolesDecorator(Roles.user)
    // async addCommande(@Req() req: Request, @Body() form: any): Promise<ServiceResponse<Commande>> {
    //     const user_id = req["user_id"]
    //     return await this.commandeService.addCommande(form, user_id);
    // }

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
