import mongoose from "mongoose";

const MAX_RETRY = 5;
const RETRY_INTERVAL = 5000;



class DatabaseConnection {

     retryCount;
     isConnected;



    constructor() {
        this.retryCount = 0;
        this.isConnected = false;

        mongoose.set("strictQuery", true);
        mongoose.connection.on("connected", () => {
            console.log(mongoose.connection.name)
            console.log("MONGODB CONNECTED SUCCESSFULLY !")
            this.isConnected = true

        });

        mongoose.connection.on("error", () => {
            console.log("ERROR IN MONGODB CONNECTION !")
            this.isConnected = false
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MONGODB DISCONNECTED !")
            this.handleDisconnection()
        });

        process.on("SIGTERM", this.handleAppTermination.bind(this));
    }

    async connect() {
        try {
            if (!process.env.MONGO_URI) {
                throw new Error("MONGODB URI IS NOT DEFINED IN THE ENV");
            }
            if (process.env.NODE_ENVIRONMENT === "development") {
                mongoose.set("debug", true)
            }

            const connectionOptions = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4 // for IPv4
            }

            await mongoose.connect(process.env.MONGO_URI, connectionOptions)
            this.retryCount = 0
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message)
            }
            else {
                console.log("ERROR IN CONNECTION", error)
            }
            await this.handleConnectionError()
        }
    }

    async handleConnectionError() {
        if (this.retryCount < MAX_RETRY) {
            this.retryCount++
            console.log(`TRYING TO CONNECT TO DATABASE ${this.retryCount} TIMES`)
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            return this.connect()
        }
        else {
            console.log("Failed to connect to MONGODB after Max Retries")
            process.exit(1)
        }
    }

    async handleDisconnection() {
        if (!this.isConnected) {
            console.log("Attempting to reconnected to mongodb ...")
           await this.connect()
        }
    }

    async handleAppTermination() {
        try {
            await mongoose.connection.close()
            console.log("MongoDB connection closed through app termination")
            process.exit(0)
        } catch (error) {
            console.log("error during database disconnection", error)
            process.exit(1)
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        }
    }
}


const dbConnect = new DatabaseConnection()
export default dbConnect.connect.bind(dbConnect)
export const getDbStatus = dbConnect.getConnectionStatus.bind(dbConnect)