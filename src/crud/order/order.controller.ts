import { Body, Controller, Get, NotFoundException, Post, Put, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { buildPopulateConfig, Roles, ServiceResponse } from 'src/common/types';
import { Order } from './order.schema';

import { RolesDecorator } from 'src/common/decorators';
import path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { createClientNewCommandeMail, createOwnerNewCommandeMail } from 'src/common/emails';
import { NotFoundError } from 'rxjs';
import { EmailService } from '../email/email.service';

@Controller('order')
// @UseGuards(RoleGuard)
export class OrderController {

    constructor(
        @InjectModel(Order.name) private commandeModel: Model<Order>,
        private orderService: OrderService,
        private userService: UserService,
        private emailService: EmailService
    ) { }

    // @Post()
    // // @RolesDecorator(Roles.client)
    // async addOrders(@Req() req: Request, @Body() form: any): Promise<ServiceResponse<Order>> {
    //     const user_id = req["user_id"]
    //     let result: ServiceResponse<Order>;

    //     const user = await this.userService.getUserById(user_id);
    //     if (!user.data) {
    //         throw new NotFoundException("L'utilisateur est introuvable !!")
    //     }


    //     const session = await this.commandeModel.db.startSession();

    //     await session.withTransaction(async () => {
    //         const addCommandeResult = await this.orderService.addOrder(form, user_id, session);

    //         if (addCommandeResult.data) {
    //             const newCommandeClientEmail = createClientNewCommandeMail(addCommandeResult.data, user.data!.email)
    //             await this.emailService.sendMail(newCommandeClientEmail.subject, newCommandeClientEmail.html, undefined, newCommandeClientEmail.to)
    //             const newCommandeOwnerEmail = createOwnerNewCommandeMail(addCommandeResult.data, user.data!.email)
    //             await this.emailService.sendMail(newCommandeOwnerEmail.subject, newCommandeOwnerEmail.html)
    //         }

    //         result = {
    //             data: addCommandeResult.data,
    //             message: addCommandeResult.message
    //         }



    //     })
    //     return result!;
    // }

    // @Get("client")
    // @RolesDecorator(Roles.client)
    // async getClientOrders(@Req() req: Request): Promise<ServiceResponse<Order[]>> {
    //     const user_id = req["user_id"]
        
    //     const relations = [
    //         {
    //             path: "packs",
    //             childs: [
    //                 { path: "pack" }
    //             ]
    //         },
    //         {
    //             path: 'client'
    //         }
    //     ]
    //     return await this.orderService.getClientOrders(user_id, relations);
    // }

    // @Post("getOrders")
    // async getAllOrders(@Body() form: any): Promise<ServiceResponse<any>> {
    //     const relations = [
    //         {
    //             path: "packs",
    //         },
    //         {
    //             path: "client"
    //         }
    //     ]

    //     const populateConfig = buildPopulateConfig(relations)
    //     return await this.orderService.getAllOrders(form, populateConfig);
    // }


    // @Put()
    // async updateOrderStatus(@Body() form: any): Promise<ServiceResponse<any>> {
    //     return await this.orderService.updateOrderStatus(form);
    // }
}
