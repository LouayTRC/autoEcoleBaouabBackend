import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Pack } from "../pack/pack.schema";
import { Services } from "../services/service.schema";
import { schemaOptions } from "src/common/types";


export type PackServicesDocument= Document & PackServices 

@Schema(schemaOptions)
export class PackServices{

    @Prop({required:true, type:Types.ObjectId, ref:Pack.name})
    pack:Pack

    @Prop({required:true, type:Types.ObjectId, ref:Services.name})
    service:Services

    @Prop({required:true})
    hours:number

}

export const PackServicesSchema=SchemaFactory.createForClass(PackServices)