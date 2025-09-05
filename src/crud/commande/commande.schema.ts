import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";
import { HydratedDocument, ObjectId, Types } from "mongoose";
import { User } from "../user/user.schema";


export type CommandeDocument = HydratedDocument<Commande>;


@Schema(schemaOptions)
export class Commande{

    @Prop({type:[{type:Object}],required:true})
    packs:{
        pack_id: Types.ObjectId;
        name: string;
        price: number;
        packServices:{
            packService_id: Types.ObjectId;
            service: Types.ObjectId;
            hours: number
        }[]
    }[]

    @Prop({required:true})
    price:number

    @Prop({required:true})
    created_at:Date

    @Prop({type:Types.ObjectId,ref:User.name,required:true})
    client:User
}

export const CommandeSchema=SchemaFactory.createForClass(Commande)