import mongoose, { Schema, Document } from 'mongoose'

interface IUser extends Document {
    username: string
    email: string
    isAdmin?: boolean
    password: string
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: false },
    email: { type: String, unique: true, required: true },
    isAdmin: { type: Boolean, default: false },
    password: { type: String, required: true }
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema)

export { IUser, User }