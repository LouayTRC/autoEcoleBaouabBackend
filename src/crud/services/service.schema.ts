import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { schemaOptions } from "src/common/types";

export type ServiceDocument = HydratedDocument<Services>;

@Schema(schemaOptions)
export class Services {

    @Prop({ required: true, unique: true })
    name: string

    @Prop({ required: true })
    echelle: string

    @Prop({ required: true })
    description: string

    @Prop({ required: true })
    image: string

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date

    @Prop()
    deletedAt: Date
}

export const ServicesSchema=SchemaFactory.createForClass(Services)

ServicesSchema.virtual('tarifs', {
    ref: 'Tarif', 
    localField: '_id',
    foreignField: 'service', 
    justOne: false
});

ServicesSchema.set('toObject', { virtuals: true });
ServicesSchema.set('toJSON', { virtuals: true });
