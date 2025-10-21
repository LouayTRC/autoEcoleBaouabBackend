import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { schemaOptions } from "src/common/types";

export type ServiceDocument = HydratedDocument<Services>;

@Schema(schemaOptions)
export class Services {

    @Prop({
        type: Object,
        required: true,
        validate: {
            validator: (v: Record<string, string>) => !!v.fr && !!v.ar, // retourne boolean
            message: 'Les traductions du nom en français et arabe sont obligatoires'
        }
    })
    name: Record<string,string>

    @Prop({
        type: Object,
        required: true,
        validate: {
            validator: (v: Record<string, string>) => !!v.fr && !!v.ar, // retourne boolean
            message: 'Les traductions du description en français et arabe sont obligatoires'
        }
    })
    description: Record<string,string>

    @Prop({ required: true })
    echelle: string

    @Prop({ required: true })
    image: string

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date

    @Prop()
    deletedAt: Date
}

export const ServicesSchema = SchemaFactory.createForClass(Services)

ServicesSchema.virtual('tarifs', {
    ref: 'Tarif',
    localField: '_id',
    foreignField: 'service',
    justOne: false
});

ServicesSchema.set('toObject', { virtuals: true });
ServicesSchema.set('toJSON', { virtuals: true });
