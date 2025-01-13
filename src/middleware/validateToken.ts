import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()    

interface CustomRequest extends Request {
    user?: JwtPayload & { username?: string; idAdmin?: boolean }
}

export const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
const token: string | undefined = req.header('Authorization')?.split(' ')[1]

if(!token) {
    res.status(401).json({ error: 'Access denied, missing token' })
    return
}

try {
    const verified: JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    req.user = verified as JwtPayload & { username?: string; isAdmin?: boolean }
    next()
} catch (error: any) {
    console.error('Error during token validation: ', error)
    res.status(401).json({ message: 'Token not found' })
}
}

export const validateAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    validateToken(req, res, () => {
        if(req.user?.isAdmin) {
            next()
        } else {
            res.status(403).json({ error: 'Access denied.' })
        }
    })
}