import { Router } from "express";
import Trace from "../models/Trace.js";
import Handover from "../models/Handover.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

r.get("/mine", requireAuth, async (req, res, next) => {
    try {
        const traces = await Trace.find({
            actor: req.user.id
        })
            .populate("pickup")
            .populate({
                path: "scrapLot",
                populate: {
                    path: "material",
                    select: "name rate unit"
                }
            })
            .sort("-createdAt");

        // Add handover proof to each scrap-lot trace
        const tracesWithHandover = await Promise.all(
            traces.map(async (trace) => {
                const traceObject = trace.toObject();

                if (trace.scrapLot?._id) {
                    const handover = await Handover.findOne({
                        scrapLot: trace.scrapLot._id
                    }).sort("-createdAt");

                    traceObject.handover = handover || null;
                } else {
                    traceObject.handover = null;
                }

                return traceObject;
            })
        );

        res.json(tracesWithHandover);

    } catch (e) {
        console.error("Trace fetch error:", e);
        next(e);
    }
});

export default r;