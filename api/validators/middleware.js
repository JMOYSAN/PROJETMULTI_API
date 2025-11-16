const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Erreur de validation',
                details: errors
            });
        }

        req.body = value;
        next();
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Erreur de validation des paramètres',
                details: errors
            });
        }

        req.params = value;
        next();
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Erreur de validation de la query',
                details: errors
            });
        }

        req.query = value;
        next();
    };
};

const validate = (schemas) => {
    return (req, res, next) => {
        const errors = [];

        if (schemas.body) {
            const { error, value } = schemas.body.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });

            if (error) {
                errors.push(...error.details.map(detail => ({
                    source: 'body',
                    field: detail.path.join('.'),
                    message: detail.message
                })));
            } else {
                req.body = value;
            }
        }

        if (schemas.params) {
            const { error, value } = schemas.params.validate(req.params, {
                abortEarly: false,
                stripUnknown: true,
            });

            if (error) {
                errors.push(...error.details.map(detail => ({
                    source: 'params',
                    field: detail.path.join('.'),
                    message: detail.message
                })));
            } else {
                req.params = value;
            }
        }

        if (schemas.query) {
            const { error, value } = schemas.query.validate(req.query, {
                abortEarly: false,
                stripUnknown: true,
            });

            if (error) {
                errors.push(...error.details.map(detail => ({
                    source: 'query',
                    field: detail.path.join('.'),
                    message: detail.message
                })));
            } else {
                req.query = value;
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Erreur de validation',
                details: errors
            });
        }

        next();
    };
};

module.exports = {
    validateBody,
    validateParams,
    validateQuery,
    validate
};