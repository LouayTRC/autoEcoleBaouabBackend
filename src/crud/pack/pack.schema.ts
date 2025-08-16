import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { schemaOptions } from "src/common/types";
import { Permis } from "src/crud/permis/permis.schema";


export type PackDocument= Document & Pack


@Schema(schemaOptions)
export class Pack{

    @Prop({type:Types.ObjectId, ref:Permis.name, required:true})
    permis:Types.ObjectId

    @Prop({required:true})
    name:string

    @Prop({required:true})
    price:number

}

export const PackSchema=SchemaFactory.createForClass(Pack)

PackSchema.virtual('packServices', {
  ref: 'PackServices',   // le modèle cible
  localField: '_id',     // champ local
  foreignField: 'pack',  // champ distant
});

PackSchema.set("toObject", { virtuals: true });
PackSchema.set("toJSON", { virtuals: true });