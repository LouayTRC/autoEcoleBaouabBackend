import Joi from "joi";


export const addPermisSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            "string.base": "Le nom doit étre une chaine de caractères !",
            "string.empty": "Le nom ne peut pas étre vide !",
            "any.required": "Le nom est obligatoire ",
        })

})