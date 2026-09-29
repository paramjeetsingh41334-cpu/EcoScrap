import { Router } from "express";
import Transaction from "../models/Transaction.js";
import { requireAuth } from "../middleware/auth.js";


const r = Router();

r.get("/mine", requireAuth, async (req, res, next) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { collector: req.user.id },
                { recycler: req.user.id }
            ]
        })
            .populate("material", "name rate")
            .populate("collector", "name email")
            .populate("recycler", "name email")
            .sort("-createdAt");

        res.json(transactions);
    } catch (e) {
        next(e);
    }
});

export default r;