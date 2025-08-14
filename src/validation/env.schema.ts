import Joi from "joi";


export const envSchema=Joi.object({
    MONGO_URI: Joi.string().uri().required(),
    PORT: Joi.number().default(3000)
})