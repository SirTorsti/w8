import { Request, Response, Router } from 'express'
import { body, Result, ValidationError, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User, IUser } from '../models/User'

const router: Router = Router()

router.post("/api/user/register", 
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("username").trim().isLength({ min: 5 }).escape(),
    async (req: Request, res: Response) => {
        const errors: Result<ValidationError> = validationResult(req)

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
        }

    try {
        const existingUser: IUser | null = await User.findOne({ email: req.body.email})
        console.log(existingUser)
        if (existingUser) {
            res.status(403).json({ error: 'Email already in use' })
            return
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = bcrypt.hashSync(req.body.password, salt)

        const newUser = await User.create({
            email: req.body.email,
            username: req.body.username,
            isAdmin: false,
            password: hash
        })
        res.json(newUser)

    } catch (error: any) {
        console.error('Error during registration: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
    }
)

router.post("/api/user/login",
    body("email").isEmail(),
    body("password").escape(),
    body("username").trim().escape(),
    async (req: Request, res: Response) => {
        try {
            const user: IUser | null = await User.findOne({ email: req.body.email })
            if (!user) {
                res.status(404).json({ error: 'Login failed' })
                return
            }

            if (!bcrypt.compareSync(req.body.password, user.password)) {
                res.status(401).json({ error: 'Login failed' })
                return
            }

            const payload: JwtPayload = {
                _id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
            const token: string = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' })  
            res.status(200).json({ success:true, token })
            
        } catch (error: any) {
            console.error('Error during login: ', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

)


export default router