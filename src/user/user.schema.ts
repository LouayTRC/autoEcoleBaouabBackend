import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { schemaOptions } from "src/common/types";
import { Role } from "src/role/role.schema";

export type UserDocument = HydratedDocument<User>;


@Schema(schemaOptions)
export class User{

    @Prop({required:true})
    firstName:string

    @Prop({required:true})
    lastName:string

    @Prop({required:true,unique:true})
    username:string

    @Prop({required:true,unique:true})
    email:string

    @Prop({required:true,unique:true,length:8})
    cin:string

    @Prop({required:true})
    password:string

    @Prop({type:Types.ObjectId,ref:Role.name,required:true})
    role:Types.ObjectId

}

export const UserSchema=SchemaFactory.createForClass(User)