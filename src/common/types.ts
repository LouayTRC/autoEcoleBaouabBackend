import { SchemaOptions } from "@nestjs/mongoose";


export interface ServiceResponse<T>{
    success:boolean;
    message?:string;
    data?:T;
    errorCode?:number
}

export enum Roles{
    admin="ADMIN",
    user="USER"
}


export const schemaOptions: SchemaOptions = {
  versionKey: false,
};