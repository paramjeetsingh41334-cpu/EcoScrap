import mongoose from "mongoose";

const scrapLotSchema = new mongoose.Schema(
    {
        collector: {
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

        indicativePrice: {
            type: Number,
            required: true,
            min: 0
        },

        photoUrl: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["AVAILABLE", "SOLD", "HANDED_OVER"],
            default: "AVAILABLE"
        },

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        requestStatus: {
            type: String,
            enum: ["NONE", "PENDING", "ACCEPTED", "REJECTED"],
            default: "NONE"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.ScrapLot ||
    mongoose.model("ScrapLot", scrapLotSchema);