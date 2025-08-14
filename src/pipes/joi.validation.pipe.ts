import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ObjectSchema } from "joi";

@Injectable()
export class JoiValidationPipe implements PipeTransform {
    constructor(private schema: ObjectSchema) { }


    transform(value: any, metadata: ArgumentMetadata) {
        const { error } = this.schema.validate(value, { abortEarly: false });
        if (error) {

            const errors = error.details.map(d => ({
                field: d.path[0],
                message: d.message,
            }));
            throw new BadRequestException(errors);
        }
        return value;
    }



}