const { query, body, param, validationResult} = require('express-validator');

function validationErrors (req,res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
}
const createValidation = [
    body('name').not().isEmpty().withMessage('Поле "name" обязательно').isLength({ min: 2 }),
    body('isMan').not().isEmpty().withMessage('Поле "isMan" обязательно')
        .isBoolean().withMessage('Поле "isMan" должно быть булевым значением'),
    body('age').not().isEmpty().withMessage('Поле "age" обязательно')
        .isLength({ min: 1, max: 2 }).isNumeric()
];

const deleteValidation = [param('id').isInt().withMessage('Параметр id должен быть целым числом')]
const getByGenderValidation = [param('gender').isString().isLength({ min: 1, max: 1 }).withMessage('Параметр gender должен быть строкой длиной 1 символ')]
const getFilteredValidation = [
    query('minAge').isNumeric().withMessage('Параметр minAge должен быть числом'),
    query('maxAge').isNumeric().withMessage('Параметр maxAge должен быть числом'),
    ]


function validateUserUpdate(req, res, next) {
    const validationRules = [
        param('id').isInt().withMessage('Параметр "id" должен быть целым числом'),
        body('name').optional().isLength({ min: 2 }),
        body('isMan').optional().isBoolean().withMessage('Поле "isMan" должно быть булевым значением'),
        body('age').optional().isLength({ min: 1, max: 2 }).isNumeric()
    ];

    validationErrors(req,res)

    next();
}

module.exports = {
    createValidation,
    deleteValidation,
    getByGenderValidation,
    getFilteredValidation,
    validateUserUpdate,
    validationErrors
};
