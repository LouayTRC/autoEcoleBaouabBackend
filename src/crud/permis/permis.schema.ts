import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { schemaOptions } from "src/common/types";

export type PermisDocument = HydratedDocument<Permis>;

@Schema(schemaOptions)
export class Permis {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true})
  image: string;
  
  @Prop({ required: true})
  createdAt: Date;
  
  @Prop()
  deletedAt: Date;

}

export const PermisSchema = SchemaFactory.createForClass(Permis)

PermisSchema.virtual('tarifs', {
    ref: 'Tarif', 
    localField: '_id',
    foreignField: 'permis', 
    justOne: false
});

PermisSchema.set('toObject', { virtuals: true });
PermisSchema.set('toJSON', { virtuals: true });