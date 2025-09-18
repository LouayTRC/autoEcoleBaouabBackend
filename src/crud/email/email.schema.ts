import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { schemaOptions } from "src/common/types";

export type EmailDocument=HydratedDocument<Email>


@Schema(schemaOptions)
export class Email {

    @Prop({ type: String, required: true })
    email: String

    @Prop({ type: String, required: true })
    subject: String

    @Prop({type:String,required:true})
    message:String
    
    @Prop({type:Number,required:true})
    status:Number
}

export const EmailSchema=SchemaFactory.createForClass(Email)