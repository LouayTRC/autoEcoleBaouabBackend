import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Permis } from "src/crud/permis/permis.schema";
import { Services } from "src/crud/services/service.schema";

import { HydratedDocument } from "mongoose";

export type WithVirtuals<T, V = {}> = HydratedDocument<T> & V;
export type PermisWithTarifs = WithVirtuals<
  Permis,
  {
    tarifs: {
      service: Services;
      price: number;
    }[];
  }
>;






@Schema({ _id: false })
export class PermisSnapshot {
  
  @Prop({ type: Types.ObjectId, ref: Permis.name, required: true })
  permis_id: Permis | Types.ObjectId;

  @Prop({ required: true })
  permisName: string;
}

export const PermisSnapshotSchema = SchemaFactory.createForClass(PermisSnapshot);






@Schema({ _id: false })
export class ServiceDetail {

  @Prop({ type: Types.ObjectId, ref: Services.name, required: true })
  service: Services | Types.ObjectId;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  qte: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  total: number;
}

export const ServiceDetailSchema = SchemaFactory.createForClass(ServiceDetail);



@Schema({_id:false})
export class AccountProvider{

    @Prop({required:true,type:String})
    provider:String

    @Prop({required:true,type:String})
    provider_id:String

    @Prop({required:true,type:Boolean})
    verified:Boolean

}

export const AccountProviderSchema=SchemaFactory.createForClass(AccountProvider)
