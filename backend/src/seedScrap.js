import dns from "node:dns";
import "dotenv/config";
import mongoose from "mongoose";
import Scrap from "./models/Scrap.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const scrapData = [
    { name: "Paper", rate: 15 },
    { name: "Cardboard", rate: 10 },
    { name: "Plastic", rate: 20 },
    { name: "Iron", rate: 35 },
    { name: "Aluminium", rate: 130 },
    { name: "Copper", rate: 600 },
    { name: "E-Waste", rate: 80 }
];

const seedScrap = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        await Scrap.deleteMany({});
        await Scrap.insertMany(scrapData);

        console.log("✅ Scrap prices added successfully");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedScrap();