import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Permis } from "src/permis/permis.schema";


export type PackDocument= Document & Pack


@Schema()
export class Pack{

    @Prop({required:true})
    name:string

    @Prop({required:true})
    price:number

    @Prop({type:Types.ObjectId, ref:Permis.name, required:true})
    permis:Types.ObjectId

}

export const PackSchema=SchemaFactory.createForClass(Pack)