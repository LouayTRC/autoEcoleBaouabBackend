import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";


export type PermisDocument=Permis & Document

@Schema(schemaOptions)
export class Permis{

    @Prop({required:true,unique:true})
    type:string;
    

}

export const PermisSchema=SchemaFactory.createForClass(Permis)