import mongoose from "mongoose";

const traceSchema = new mongoose.Schema(
    {
        pickup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pickup",
            default: null,
            index: true
        },

        scrapLot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ScrapLot",
            default: null,
            index: true
        },

        stage: {
            type: String,
            enum: [
                "COLLECTED",
                "AGGREGATED",
                "SENT_TO_RECYCLER",
                "RECYCLED"
            ],
            required: true
        },

        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        note: {
            type: String,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Trace ||
    mongoose.model("Trace", traceSchema);