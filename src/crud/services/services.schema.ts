import { Prop, Schema } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";


@Schema(schemaOptions)
export class Services{

    @Prop({required:true})
    name:string

    
}