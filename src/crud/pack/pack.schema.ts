import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Permis } from "../permis/permis.schema";
import { Services } from "../services/service.schema";
import { schemaOptions } from "src/common/types";
import { boolean, required, string } from "joi";
import { PermisSnapshot, PermisSnapshotSchema, ServiceDetail, ServiceDetailSchema } from "src/common/snapshotTypes";

export type PackDocument = HydratedDocument<Pack>;

@Schema(schemaOptions)
export class Pack {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: PermisSnapshotSchema, required: true })
  permis: PermisSnapshot;

  @Prop({ type: [ServiceDetailSchema],default:[]})
  details: ServiceDetail[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  reduction: number; 

  @Prop({ required: true })
  total: number; 

  @Prop({type:Number,required:true,default:1})
  status:number
}

export const PackSchema = SchemaFactory.createForClass(Pack);

PackSchema.set("toObject", { virtuals: true });
PackSchema.set("toJSON", { virtuals: true });




@Schema({ _id: false })
export class PackSnapshot {
  @Prop({ type: Types.ObjectId, ref: Pack.name, required: true })
  pack: Pack | Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  reduction: number;

  @Prop({ type: Number, required: true })
  total: number; 

  @Prop({ type: [ServiceDetailSchema], default: [] })
  services: ServiceDetail[]; 
}

export const PackSnapshotSchema=SchemaFactory.createForClass(PackSnapshot)