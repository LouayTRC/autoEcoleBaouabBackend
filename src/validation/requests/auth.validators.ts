import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .messages({
      'string.base': 'Le prénom doit être une chaîne de caractères',
      'any.required': 'Le prénom est obligatoire',
      'string.empty': 'Le prénom ne peut pas être vide'
    }),

  lastName: Joi.string()
    .required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'any.required': 'Le nom est obligatoire',
      'string.empty': 'Le nom ne peut pas être vide'
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': "Le nom d'utilisateur doit être une chaîne de caractères",
      'string.alphanum': "Le nom d'utilisateur doit contenir seulement des lettres et chiffres",
      'string.min': "Le nom d'utilisateur doit contenir au moins 3 caractères",
      'string.max': "Le nom d'utilisateur ne peut pas dépasser 30 caractères",
      'any.required': "Le nom d'utilisateur est obligatoire",
      'string.empty': "Le nom d'utilisateur ne peut pas être vide"
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': "L'email doit être une chaîne de caractères",
      'string.email': "L'email n'est pas valide",
      'any.required': "L'email est obligatoire",
      'string.empty': "L'email ne peut pas être vide"
    }),

  cin: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.base': "Le CIN doit être une chaîne de caractères",
      'string.pattern.base': "Le CIN doit contenir uniquement des chiffres",
      'any.required': "Le CIN est obligatoire",
      'string.empty': "Le CIN ne peut pas être vide"
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Le mot de passe doit être une chaîne de caractères',
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est obligatoire',
      'string.empty': 'Le mot de passe ne peut pas être vide'
    }),

  role: Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
      'string.base': "Le rôle doit être une chaîne de caractères",
      'string.length': "Le rôle doit être un identifiant MongoDB valide (24 caractères hexadécimaux)",
      'string.hex': "Le rôle doit être un identifiant hexadécimal",
      'any.required': "Le rôle est obligatoire",
      'string.empty': "Le rôle ne peut pas être vide"
    })
});


export const loginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': "Le nom d'utilisateur doit être une chaîne de caractères",
      'string.alphanum': "Le nom d'utilisateur doit contenir seulement des lettres et chiffres",
      'string.min': "Le nom d'utilisateur doit contenir au moins 3 caractères",
      'string.max': "Le nom d'utilisateur ne peut pas dépasser 30 caractères",
      'any.required': "Le nom d'utilisateur est obligatoire",
      'string.empty': "Le nom d'utilisateur ne peut pas être vide"
    }),

  password: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.base': 'Le mot de passe doit être une chaîne de caractères',
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est obligatoire',
      'string.empty': 'Le mot de passe ne peut pas être vide'
    })
});
