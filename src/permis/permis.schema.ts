import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export type PermisDocument=Permis & Document

@Schema()
export class Permis{

    @Prop({required:true,unique:true})
    type:string;

    

}

export const PermisSchema=SchemaFactory.createForClass(Permis)