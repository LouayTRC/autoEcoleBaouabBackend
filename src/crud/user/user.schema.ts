import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AccountProvider, AccountProviderSchema } from "src/common/snapshotTypes";
import { Roles, schemaOptions } from "src/common/types";
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

    @Prop({type:[AccountProviderSchema],default:[]})
    linkedAccounts:AccountProvider[]

    @Prop({type:Types.ObjectId,ref:Role.name,required:true})
    role:Types.ObjectId

    @Prop({required:false,length:8})
    phone?:string

    @Prop({required:false,select:false})
    password?:string

}

export const UserSchema=SchemaFactory.createForClass(User)


