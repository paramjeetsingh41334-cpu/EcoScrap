import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        type: {
            type: String,
           enum: [
    "PICKUP",
    "MARKETPLACE",
    "REVIEW",
    "HANDOVER",
    "PAYMENT",
    "GENERAL"
],
            default: "GENERAL"
        },

        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);