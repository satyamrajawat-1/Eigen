// MUST be the very first import — loads .env before any other module reads process.env
import 'dotenv/config';
import {app} from "./app.js"
import dbConnect from "./db/dbConnect.js";

const PORT = process.env.PORT || 10000;

dbConnect()
.then(()=>{
    app.on('error',(error)=>{
        console.log("ERROR IN CONNECT APP",error)
    })
    app.listen(PORT,()=>{
        console.log(`app is listening on ${PORT}`)
    })
})
.catch((error)=>{
    console.log("DATABASE CONNECTION ERROR",error)
})