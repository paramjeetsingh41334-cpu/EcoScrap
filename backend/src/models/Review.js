import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        pickup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pickup",
            required: true,
            unique: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        collector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Review", schema);