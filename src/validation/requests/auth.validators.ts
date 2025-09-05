import Joi from 'joi';

export const registerSchema = Joi.object({
  fullname: Joi.string()
    .required()
    .messages({
      'string.base': 'Le nom complet doit être une chaîne de caractères',
      'any.required': 'Le nom complet est obligatoire',
      'string.empty': 'Le nom complet ne peut pas être vide'
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

  phone: Joi.string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.base': "Le numéro de téléphone doit être une chaîne de caractères",
      'string.pattern.base': "Le numéro de téléphone doit contenir uniquement des chiffres",
      'any.required': "Le numéro de téléphone est obligatoire",
      'string.empty': "Le numéro de téléphone ne peut pas être vide"
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
});


export const loginSchema = Joi.object({
  identifiant: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': "L'identifiant doit être une chaîne de caractères",
      'string.alphanum': "L'identifiant doit contenir seulement des lettres et chiffres",
      'string.min': "L'identifiant doit contenir au moins 3 caractères",
      'string.max': "L'identifiant ne peut pas dépasser 30 caractères",
      'any.required': "L'identifiant est obligatoire",
      'string.empty': "L'identifiant ne peut pas être vide"
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
