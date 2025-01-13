import { Request, Response, Router } from 'express'
import { body, Result, ValidationError, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User, IUser } from '../models/User'
import { registerValidation, loginValidation } from '../validators/inputValidation'
import { validateToken, validateAdmin } from '../middleware/validateToken'
import { Topic, ITopic } from '../models/Topic'

interface CustomRequest extends Request {
    user?: JwtPayload & { username?: string; isAdmin?: boolean }
}

const router: Router = Router()

router.post("/api/user/register", 
    registerValidation,
    async (req: Request, res: Response) => {
        const errors: Result<ValidationError> = validationResult(req)

        if (!errors.isEmpty()) { 
            res.status(400).json({ errors: errors.array() })
            return
        }

    try {
        const existingUser: IUser | null = await User.findOne({ email: req.body.email})
        if (existingUser) {
            res.status(403).json({ error: 'Email already in use' })
            return
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = bcrypt.hashSync(req.body.password, salt)

        const isAdmin = req.body.isAdmin === true;

        const newUser = await User.create({
            email: req.body.email,
            username: req.body.username,
            isAdmin: isAdmin,
            password: hash
        })
        await newUser.save();
        res.json(newUser)

    } catch (error: any) {
        console.error('Error during registration: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
    }
)

router.post("/api/user/login", 
    loginValidation,
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

router.get("/api/topics", async (req: Request, res: Response) => {
    try {
        const topics: ITopic[] = await Topic.find()
        res.json(topics)

    }   catch (error:any) {
        console.error('Error fetching topics: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post("/api/topic", validateToken, async (req: CustomRequest, res: Response) => {
    try {
        const newTopic = new Topic({
            title: req.body.title,
            content: req.body.content,
            username: req.user?.username,
            createdAt: new Date()
        })
        await newTopic.save()
        res.json(newTopic)

    } catch (error: any) {
        console.error('Error creating topic: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete("/api/topic/:id", validateAdmin, async (req: CustomRequest, res: Response) => {
    try {
        await Topic.findByIdAndDelete(req.params.id)
        res.json({ message: 'Topic deleted successfully.' })
    } catch (error: any) {
        console.error('Error deleting topic: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})


export default router