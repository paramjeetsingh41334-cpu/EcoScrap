import mongoose from "mongoose";

const handoverSchema = new mongoose.Schema(
    {
        scrapLot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ScrapLot",
            required: true
        },

        collector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        recycler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scrap",
            required: true
        },

        weight: {
            type: Number,
            required: true,
            min: 0
        },

        finalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        receiptNo: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ["PENDING", "COMPLETED"],
            default: "PENDING"
        },

        handoverDate: {
            type: Date,
            default: Date.now
        },

        // 📍 GPS proof
        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },

        // 📸 Photo proof
        photoUrl: {
            type: String,
            default: ""
        },

        // 📝 Optional handover notes
        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Handover", handoverSchema);