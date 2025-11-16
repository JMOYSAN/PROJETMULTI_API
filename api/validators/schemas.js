const Joi = require('joi');

const authSchemas = {
    register: Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.alphanum': 'Le nom d\'utilisateur ne peut contenir que des lettres et chiffres',
                'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
                'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères',
                'any.required': 'Le nom d\'utilisateur est requis'
            }),

        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
                'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères',
                'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
                'any.required': 'Le mot de passe est requis'
            })
    }),

    login: Joi.object({
        username: Joi.string()
            .required()
            .messages({
                'any.required': 'Le nom d\'utilisateur est requis'
            }),

        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Le mot de passe est requis'
            })
    })
};

const userSchemas = {
    create: Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required(),

        theme: Joi.string()
            .valid('light', 'dark', 'default')
            .default('default'),

        status: Joi.string()
            .valid('online', 'offline', 'away')
            .default('offline'),

        isadmin: Joi.number()
            .integer()
            .valid(0, 1)
            .default(0)
    }),

    update: Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .optional(),

        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .optional(),

        theme: Joi.string()
            .valid('light', 'dark', 'default')
            .optional(),

        status: Joi.string()
            .valid('online', 'offline', 'away')
            .optional(),

        isadmin: Joi.number()
            .integer()
            .valid(0, 1)
            .optional()
    }).min(1).messages({
        'object.min': 'Au moins un champ doit être fourni pour la mise à jour'
    }),

    idParam: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'number.base': 'L\'ID doit être un nombre',
                'number.positive': 'L\'ID doit être positif'
            })
    })
};

const groupSchemas = {
    create: Joi.object({
        name: Joi.string()
            .min(1)
            .max(100)
            .trim()
            .required()
            .messages({
                'string.empty': 'Le nom du groupe ne peut pas être vide',
                'string.max': 'Le nom du groupe ne peut pas dépasser 100 caractères',
                'any.required': 'Le nom du groupe est requis'
            }),

        is_private: Joi.boolean()
            .default(false)
    }),

    update: Joi.object({
        name: Joi.string()
            .min(1)
            .max(100)
            .trim()
            .optional(),

        description: Joi.string()
            .max(500)
            .allow('', null)
            .optional(),

        is_private: Joi.boolean()
            .optional()
    }).min(1).messages({
        'object.min': 'Au moins un champ doit être fourni pour la mise à jour'
    }),

    idParam: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
    }),

    addUser: Joi.object({
        groupId: Joi.number()
            .integer()
            .positive()
            .required(),

        userId: Joi.number()
            .integer()
            .positive()
            .required()
    })
};

const messageSchemas = {
    create: Joi.object({
        content: Joi.string()
            .min(1)
            .max(5000)
            .trim()
            .required()
            .messages({
                'string.empty': 'Le message ne peut pas être vide',
                'string.max': 'Le message ne peut pas dépasser 5000 caractères',
                'any.required': 'Le contenu du message est requis'
            }),

        user_id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'any.required': 'L\'ID utilisateur est requis',
                'number.positive': 'L\'ID utilisateur doit être positif'
            }),

        group_id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'any.required': 'L\'ID du groupe est requis',
                'number.positive': 'L\'ID du groupe doit être positif'
            })
    }),

    query: Joi.object({
        lastCreatedAt: Joi.date()
            .iso()
            .optional(),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20),

        groupId: Joi.number()
            .integer()
            .positive()
            .optional()
    }),

    lazyLoadQuery: Joi.object({
        beforeId: Joi.number()
            .integer()
            .positive()
            .optional(),

        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20)
    })
};

const groupUserSchemas = {
    create: Joi.object({
        userId: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'any.required': 'L\'ID utilisateur est requis'
            }),

        groupId: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'any.required': 'L\'ID du groupe est requis'
            })
    }),

    delete: Joi.object({
        userId: Joi.number()
            .integer()
            .positive()
            .required(),

        groupId: Joi.number()
            .integer()
            .positive()
            .required()
    })
};

const searchSchemas = {
    termParam: Joi.object({
        term: Joi.string()
            .min(1)
            .max(100)
            .trim()
            .pattern(/^[a-zA-Z0-9\sÀ-ÿ\-_]+$/)
            .required()
            .messages({
                'string.empty': 'Le terme de recherche ne peut pas être vide',
                'string.max': 'Le terme de recherche ne peut pas dépasser 100 caractères',
                'string.pattern.base': 'Le terme de recherche contient des caractères non autorisés',
                'any.required': 'Le terme de recherche est requis'
            })
    })
};

module.exports = {
    auth: authSchemas,
    user: userSchemas,
    group: groupSchemas,
    message: messageSchemas,
    groupUser: groupUserSchemas,
    search: searchSchemas
};