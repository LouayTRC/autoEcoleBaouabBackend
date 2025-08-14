import Joi from "joi";


export const addRoleSchema=Joi.object({
    name: Joi.string()
    .required()
    .messages({
        "string.base":"Nom du role doit étre une chaine de caractères",
        "string.empty":"Nom du role ne peut pas étre vide",
        "any.required": "Nom du role est Obligatoire"
    })
})