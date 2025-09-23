import { SchemaOptions } from "@nestjs/mongoose";


export interface ServiceResponse<T> {
  data: T;
  message?: string;
}

export enum Roles {
  admin = "ADMIN",
  client = "CLIENT"
}


export const schemaOptions: SchemaOptions = {
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
    const { _id, ...rest } = ret;
    return { id: _id.toString(), ...rest };
  },
  },
  toObject: {
    virtuals: true,
  },
};


export function buildPopulateConfig(relations: any[]): any[] {
  return relations.map(rel => {
    const populateConfig: any = { path: rel.path };

    // copier options si présentes
    if (rel.options) {
      populateConfig.options = rel.options;
    }

    if (rel.childs && rel.childs.length > 0) {
      populateConfig.populate = buildPopulateConfig(rel.childs);
    }

    return populateConfig;
  });
}
