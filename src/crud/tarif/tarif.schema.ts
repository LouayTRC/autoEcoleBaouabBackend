import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { schemaOptions } from "src/common/types";
import { Permis } from "../permis/permis.schema";
import { Services } from "../services/service.schema";

export type TarifDocument = HydratedDocument<Tarif>;

@Schema(schemaOptions)
export class Tarif {

    @Prop({type:Types.ObjectId,ref:'Permis',required:true})
    permis:Permis

    @Prop({type:Types.ObjectId,ref:'Services',required:true})
    service:Services

    @Prop({type:Number,required:true})
    price:number

}

export const TarifSchema=SchemaFactory.createForClass(Tarif)