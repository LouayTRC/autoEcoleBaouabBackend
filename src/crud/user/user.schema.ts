import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AccountProvider, AccountProviderSchema } from "src/common/snapshotTypes";
import { Roles, schemaOptions } from "src/common/types";
import { Role } from "src/crud/role/role.schema";
import { Order } from "../order/order.schema";

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

    @Prop({required:false,select:false})
    resetToken?:string

    @Prop({required:false,select:false})
    resetTokenExpiration?:Date

}

export const UserSchema=SchemaFactory.createForClass(User)

UserSchema.virtual("orders",{
    localField:"_id",
    foreignField:"client",
    ref:"Order",
    justOne:false
})

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });
