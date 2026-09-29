import mongoose from "mongoose";

const recyclingCertificateSchema = new mongoose.Schema(
    {
        certificateNo: {
            type: String,
            required: true,
            unique: true
        },

        handover: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Handover",
            required: true,
            unique: true
        },

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

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        receiptNo: {
            type: String,
            required: true
        },

        certificateDate: {
            type: Date,
            default: Date.now
        },

        verificationStatus: {
            type: String,
            enum: ["VERIFIED", "PENDING"],
            default: "VERIFIED"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "RecyclingCertificate",
    recyclingCertificateSchema
);