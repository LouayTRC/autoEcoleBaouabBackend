import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { schemaOptions } from "src/common/types";
import { Role } from "src/crud/role/role.schema";

export type UserDocument = HydratedDocument<User>;


@Schema(schemaOptions)
export class User{

    @Prop({required:true})
    fullname:string

    @Prop({required:true,unique:true})
    username:string

    @Prop({required:true,unique:true})
    email:string

    @Prop({required:true,length:8})
    phone:string

    @Prop({required:true,select:false})
    password:string

    @Prop({type:Types.ObjectId,ref:Role.name,required:true})
    role:Types.ObjectId

}

export const UserSchema=SchemaFactory.createForClass(User)

