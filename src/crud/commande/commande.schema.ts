import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";
import { Pack } from "../pack/pack.schema";
import { Types } from "mongoose";
import { User } from "../user/user.schema";

export type CommandeDocument= Document & Commande

@Schema(schemaOptions)
export class Commande{

    @Prop({type:[{type:Types.ObjectId, ref:Pack.name}],required:true})
    packs:Pack[]

    @Prop({required:true})
    price:number

    @Prop({required:true})
    created_at:Date

    @Prop({type:Types.ObjectId,ref:User.name,required:true})
    client:User
}

export const CommandeSchema=SchemaFactory.createForClass(Commande)