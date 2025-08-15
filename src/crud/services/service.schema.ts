import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";

export type ServiceDocument= Document & Services;

@Schema(schemaOptions)
export class Services {

    @Prop({ required: true, unique: true })
    name: string

}

export const ServicesSchema=SchemaFactory.createForClass(Services)