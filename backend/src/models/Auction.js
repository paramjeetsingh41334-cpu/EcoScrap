import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
    {
        bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        pricePerKg: {
            type: Number,
            required: true,
            min: 0
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const auctionSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        creatorRole: {
            type: String,
            enum: ["COLLECTOR", "ORGANIZATION"],
            required: true
        },

        title: {
            type: String,
            required: true,
            maxlength: 150
        },

        // Kept as text so the current frontend continues working
        material: {
            type: String,
            required: true
        },

        // Proper Scrap reference for transactions
        materialRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scrap",
            default: null
        },

        // Scrap lot connected to this auction
        scrapLot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ScrapLot",
            default: null
        },

        estimatedKg: {
            type: Number,
            required: true,
            min: 1
        },

        startingBid: {
            type: Number,
            required: true,
            min: 0
        },

        currentBid: {
            type: Number,
            required: true,
            min: 0
        },

        endsAt: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["OPEN", "CLOSED", "CANCELLED"],
            default: "OPEN",
            index: true
        },

        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            default: null
        },

        bids: [bidSchema]
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Auction ||
    mongoose.model("Auction", auctionSchema);