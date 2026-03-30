import dotenv from "dotenv"
import {app} from "./app.js"
import dbConnect from "./db/dbConnect.js";



dotenv.config()
dbConnect()
.then(()=>{
    app.on('error',(error)=>{
        console.log("ERROR IN CONNECT APP",error)
    })
    app.listen(process.env.PORT,()=>{
        console.log(`app is listening on ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("DATABASE CONNECTION ERROR",error)
})