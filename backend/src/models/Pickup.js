import mongoose from 'mongoose';

const item = new mongoose.Schema(
    {
        scrap: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scrap',
            required: true
        },
        estimatedWeight: {
            type: Number,
            min: 0,
            required: true
        }
    },
    { _id: false }
);

const schema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        collector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        items: [item],

        address: {
            type: String,
            required: true,
            maxLength: 500
        },

        // 📍 Location used by Smart Route Optimization
        location: {
            latitude: {
                type: Number,
                min: -90,
                max: 90,
                default: null
            },
            longitude: {
                type: Number,
                min: -180,
                max: 180,
                default: null
            }
        },

        slot: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                'REQUESTED',
                'ACCEPTED',
                'ON_WAY',
                'ARRIVED',
                'COMPLETED',
                'CANCELLED'
            ],
            default: 'REQUESTED',
            index: true
        },

        actualWeight: {
            type: Number,
            min: 0,
            default: 0
        },

        finalAmount: {
            type: Number,
            min: 0,
            default: 0
        },

        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID'],
            default: 'PENDING'
        },

        receiptNo: {
            type: String,
            unique: true,
            sparse: true
        },

        syncedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export default mongoose.model('Pickup', schema);