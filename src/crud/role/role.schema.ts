import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { schemaOptions } from "src/common/types";

export type RoleDocument = Document & Role


@Schema(schemaOptions)
export class Role{

    @Prop({required:true})
    name:string

}

export const RoleSchema=SchemaFactory.createForClass(Role)