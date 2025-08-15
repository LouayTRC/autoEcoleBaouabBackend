import * as Joi from 'joi';

export const objectIdSchema = Joi.string()
  .length(24)
  .hex()
  .required()
  .messages({
    'string.base': "L'ID doit être une chaîne",
    'string.length': "L'ID doit contenir exactement 24 caractères",
    'string.hex': "L'ID doit être en hexadécimal",
    'any.required': "L'ID est requis",
  });
