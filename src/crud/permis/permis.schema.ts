import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { schemaOptions } from "src/common/types";

export type PermisDocument = HydratedDocument<Permis>;

@Schema(schemaOptions)
export class Permis {

  @Prop({
    type: Object,
    required: true,
    validate: {
      validator: (v: Record<string, string>) => !!v.fr && !!v.ar, // retourne boolean
      message: 'Les traductions du nom en français et arabe sont obligatoires'
    }
  })
  name: Record<string, string>;

  @Prop({
    type: Object,
    required: true,
    validate: {
      validator: (v: Record<string, string>) => !!v.fr && !!v.ar, // retourne boolean
      message: 'Les traductions du type de vehicule en français et arabe sont obligatoires'
    }
  })
  typeVehicule: Record<string, string>;

  @Prop({
    type: Object,
    required: true,
    validate: {
      validator: (v: Record<string, string>) => !!v.fr && !!v.ar, // retourne boolean
      message: 'Les traductions du description en français et arabe sont obligatoires'
    }
  })
  description: Record<string, string>;


  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
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