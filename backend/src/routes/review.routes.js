import { Router } from "express";
import Review from "../models/Review.js";
import Pickup from "../models/Pickup.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

/* Check whether the current user has already reviewed a pickup */
r.get("/pickup/:pickupId", requireAuth, async (req, res, next) => {
    try {
        const review = await Review.findOne({
            pickup: req.params.pickupId,
            user: req.user._id
        });

        res.json({
            submitted: Boolean(review),
            review: review || null
        });

    } catch (e) {
        next(e);
    }
});

/* Submit review */
r.post("/", requireAuth, async (req, res, next) => {
    try {
        const { pickupId, rating, comment } = req.body;

        const pickup = await Pickup.findById(pickupId);

        if (!pickup) {
            return res.status(404).json({
                message: "Pickup not found"
            });
        }

        if (pickup.status !== "COMPLETED") {
            return res.status(400).json({
                message: "Pickup must be completed first"
            });
        }

        if (String(pickup.user) !== String(req.user._id)) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        if (!pickup.collector) {
            return res.status(400).json({
                message: "No collector assigned"
            });
        }

        const existingReview = await Review.findOne({
            pickup: pickup._id,
            user: req.user._id
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this pickup",
                review: existingReview
            });
        }

        const review = await Review.create({
            pickup: pickup._id,
            user: req.user._id,
            collector: pickup.collector,
            rating,
            comment
        });

        res.status(201).json(review);

    } catch (e) {
        if (e?.code === 11000) {
            return res.status(409).json({
                message: "You have already reviewed this pickup"
            });
        }

        next(e);
    }
});

/* Get reviews for a collector */
r.get("/collector/:id", requireAuth, async (req, res, next) => {
    try {
        const reviews = await Review.find({
            collector: req.params.id
        })
            .populate("user", "name")
            .sort("-createdAt");

        res.json(reviews);

    } catch (e) {
        next(e);
    }
});

export default r;