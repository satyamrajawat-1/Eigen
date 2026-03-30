import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import userRouter from "./routes/user.routes.js"
import eventRouter from "./routes/event.routes.js"
import teamRouter from "./routes/team.routes.js"
const app = express();
app.use(cookieParser())


app.use(cors({
    origin:"http://localhost:3175",
    credentials:true,
    methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization","X-Requested-With","Accept"]
}))


app.use(express.json({
    limit:"16kb"
}))


app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))


app.use(express.static("public"))


app.use("/api/v1/user" , userRouter)
app.use("/api/v1/event" , eventRouter)
app.use("/api/v1/team" , teamRouter)


export {app}