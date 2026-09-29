import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
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
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        receiptNo: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ["COMPLETED"],
            default: "COMPLETED"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Transaction ||
    mongoose.model("Transaction", transactionSchema);