import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";
import { HydratedDocument, ObjectId, Types } from "mongoose";
import { User } from "../user/user.schema";
import { PackSnapshot, PackSnapshotSchema } from "../pack/pack.schema";


export type OrderDocument = HydratedDocument<Order>;


@Schema(schemaOptions)
export class Order{

    @Prop({type:[PackSnapshotSchema],default:[]})
    packs:PackSnapshot[]

    @Prop({required:true})
    price:number

    @Prop({required:true})
    created_at:Date

    @Prop({type:Types.ObjectId,ref:User.name,required:true})
    client:User

    @Prop({type:String,required:true})
    paymentMethod:String

    @Prop({type:Number,required:true})
    status:Number
}

export const OrderSchema=SchemaFactory.createForClass(Order)