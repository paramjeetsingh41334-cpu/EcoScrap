// import mongoose from 'mongoose';
// export async function connectDB(){
//   const uri = process.env.MONGO_URI;
//   if(!uri) throw new Error('MONGO_URI is missing');
//   await mongoose.connect(uri);
//   console.log('MongoDB connected');
// }

// import dns from "node:dns";
// import mongoose from "mongoose";

// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// export async function connectDB() {
//     try {
//         const uri = process.env.MONGO_URI;

//         if (!uri) {
//             throw new Error("MONGO_URI is missing");
//         }

//         await mongoose.connect(uri);

//         console.log("MongoDB connected");
//     } catch (error) {
//         console.error("MongoDB connection failed:", error);
//         process.exit(1);
//     }
// }

import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI is missing");
        }

        await mongoose.connect(uri);

        console.log("MongoDB connected");
        console.log("DATABASE:", mongoose.connection.name);
        console.log("HOST:", mongoose.connection.host);

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}