import express, {Express} from "express"
import path from "path"
import morgan from "morgan"
import router from "./src/routes/router"
import mongoose, { Connection } from 'mongoose'
import dotenv from "dotenv"

dotenv.config()

const app: Express = express()
const port: number = parseInt(process.env.PORT as string) || 3000

const mongoDB: string = process.env.MONGODB_URI as string
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

//app.use(passport.initialize())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, '../public')))
app.use('/', router)