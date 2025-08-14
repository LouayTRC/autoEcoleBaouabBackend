import { SchemaOptions } from "@nestjs/mongoose";


export interface ServiceResponse<T> {
  data: T;
  message?: string;
}

export enum Roles {
  admin = "ADMIN",
  user = "USER"
}


export const schemaOptions: SchemaOptions = {
  versionKey: false,
};