import Joi from "joi";


export const addPermisSchema=Joi.object({
    type: Joi.string()
    .required()
    .messages({
        "string.base":"Le type doit étre une chaine de caractères !",
        "string.empty":"Le type ne peut pas étre vide !",
        "any.required":"Le type est obligatoire ",
    })
})