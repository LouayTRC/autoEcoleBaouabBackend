import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { buildPopulateConfig, ServiceResponse } from 'src/common/types';
import { PackService } from '../pack/pack.service';
import { ServiceDetail } from 'src/common/snapshotTypes';

@Injectable()
export class OrderService {

    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        private packService: PackService
    ) { }

    async addOrder(form: any, user_id: string, session?: ClientSession): Promise<ServiceResponse<Order>> {
        const { pack_id, paymentMethod } = form

        const pack = await this.packService.getPackById(pack_id, session);
        if (!pack.data) {
            throw new NotFoundException("Ce pack est introuvable !");
        }

        if (pack.data.status != 1) {
            throw new ForbiddenException("Ce pack n'est pas disponible !")
        }


        try {
            const commande = await this.orderModel.create({
                client: new Types.ObjectId(user_id),
                packs: [
                    {
                        pack: pack.data,
                        name: pack.data.name,
                        price: pack.data.price,
                        reduction: pack.data.reduction,
                        total: pack.data.total,
                        services: pack.data.details
                    }
                ],
                price: pack.data.price,
                status: 0,
                paymentMethod,
                created_at: new Date().toISOString()
            })

            return {
                data: commande,
                message: "Commande créé avec succès !"
            }
        } catch (error) {
            console.error("err", error);

            throw new InternalServerErrorException("Problème dans la création du commande !")
        }
    }

    async getAllOrders(params: any, relations?: string[]): Promise<ServiceResponse<any>> {
        try {
            const {
                search,
                status,
                minPrice,
                maxPrice,
                startDate,
                endDate,
                page = 1,
                limit = 10
            } = params;

            // 🔹 Filtres simples
            const filter: any = {};
            if (status !== undefined) filter.status = status;
            if (minPrice !== undefined || maxPrice !== undefined) {
                filter.price = {};
                if (minPrice !== undefined) filter.price.$gte = minPrice;
                if (maxPrice !== undefined) filter.price.$lte = maxPrice;
            }
            if (startDate || endDate) {
                filter.created_at = {};
                if (startDate) filter.created_at.$gte = new Date(startDate);
                if (endDate) filter.created_at.$lte = new Date(endDate);
            }

            const skip = (page - 1) * limit;

            // 🔹 Populate client et packs
            let query = this.orderModel.find(filter)
                .skip(skip)
                .limit(limit);

            if (!relations || relations.length === 0) {
                query = query.populate("client").populate("packs.pack");
            } else {
                // Si tu passes des relations spécifiques
                const populateConfig = buildPopulateConfig(relations);
                populateConfig.forEach(pop => query = query.populate(pop));
            }

            let orders = await query.exec();

            // 🔹 Filtre texte côté backend (client ou pack)
            if (search) {
                const regex = new RegExp(search, "i");
                orders = orders.filter(o =>
                    (o.client && (
                        regex.test(o.client.email) ||
                        regex.test(o.client.fullname) ||
                        regex.test(o.client.username)
                    )) ||
                    o.packs.some(p => regex.test(p.name))
                );
            }

            // 🔹 Compter le total pour la pagination
            const totalCount = await this.orderModel.countDocuments(filter).exec();
            const totalPages = Math.ceil(totalCount / limit);

            return {
                data: {
                    orders,
                    total: totalCount,
                    page,
                    limit,
                    totalPages
                }
            };

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("Problème dans la récupération des commandes !");
        }
    }




    async getClientOrders(user_id: string, relations?: any[]): Promise<ServiceResponse<Order[]>> {
        try {
            
            const populateConfig = relations ? buildPopulateConfig(relations) : [];

            let query = this.orderModel.find({ client: new Types.ObjectId(user_id)});
            if (populateConfig.length > 0) {
                query = query.populate(populateConfig);
            }

            const commandes = await query.exec()
            return {
                data: commandes
            }
        } catch (error) {
            throw new InternalServerErrorException("Problème dans la récupération des commandes !")
        }
    }


    async getOrderById(id: string, session?: ClientSession): Promise<ServiceResponse<OrderDocument | null>> {
        const order = await this.orderModel.findById(id).session(session ?? null);

        return {
            data: order
        }
    }


    async updateOrder(update: { id: string, status?: number, paymentMethod?: string, price?: number }): Promise<ServiceResponse<Order>> {
        const { id, ...fieldsToUpdate } = update;

        // 🔹 Trouver et mettre à jour en une seule opération
        const order = await this.orderModel.findOneAndUpdate(
            { _id: new Types.ObjectId(id) },
            { $set: fieldsToUpdate },
            { new: true } // 🔹 Retourne le document après modification
        );

        if (!order) {
            throw new NotFoundException("Cette commande est introuvable !");
        }

        return {
            data: order,
            message: "Commande mise à jour avec succès !"
        };
    }


    async updateOrderStatus(form: {id:string,status:number}): Promise<ServiceResponse<Order>> {
        const { id, status } = form;

        const getOrder = await this.getOrderById(id);
        if (!getOrder) {
            throw new NotFoundException("Cette commande est introuvable !")
        }

        const ancienOrder: Order = getOrder.data!;

        if ((status == 2 && ancienOrder.status != 1) || (status == -1)) {
            throw new ForbiddenException("Ce changement est interdit !")
        }

        const order = await this.orderModel.findOneAndUpdate(
            { _id:new Types.ObjectId(id) }, {
            $set: { status }
        },
            { new: true });

        if (!order) {
            throw new NotFoundException("Cette commande est introuvable !");
        }

        return {
            data: order,
            message: "Commande mise à jour avec succès !"
        };
    }




}
