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



export function buildPopulateConfig(relations: any[]): any[] {
  return relations.map(rel => {
    let populateConfig: any = { path: rel.path };

    if (rel.childs && rel.childs.length > 0) {
      populateConfig.populate = buildPopulateConfig(rel.childs);
    }

    return populateConfig;
  });
}