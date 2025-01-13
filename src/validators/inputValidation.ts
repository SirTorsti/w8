import { body } from 'express-validator'

export const registerValidation = [

    body("email").isEmail().withMessage("Must be valid email").trim().escape(),
    body("password").isLength({ min: 8 })
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
    body("username").trim().isLength({ min: 3, max: 25 }).withMessage("Username must be within 3 to 25 characters")
    .escape()
]

export const loginValidation = [
    body("email").isEmail().withMessage("Must be valid email").trim().escape(),
    body("password").escape()
]