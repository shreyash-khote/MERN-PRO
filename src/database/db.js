import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dns from "dns";

// This tells your app to use Google/Cloudflare DNS to find MongoDB.
// We need this to fix the "querySrv ECONNREFUSED" error!
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB  connected! HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("mongoDB connection error",error);
        process.exit(1)
    }
}

export default connectDB