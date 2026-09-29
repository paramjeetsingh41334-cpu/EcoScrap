import express from "express";
import Handover from "../models/Handover.js";
import ScrapLot from "../models/ScrapLot.js";
import Transaction from "../models/Transaction.js";
import Trace from "../models/Trace.js";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:id/complete", requireAuth, async (req, res) => {
    try {
        console.log("========== HANDOVER START ==========");
        console.log("Lot ID:", req.params.id);
        console.log("User ID:", req.user.id);

        const {
            latitude,
            longitude,
            photoUrl
        } = req.body;

        const lot = await ScrapLot.findById(req.params.id);

        if (!lot) {
            return res.status(404).json({
                success: false,
                message: "Scrap lot not found"
            });
        }

        console.log("Lot found:", lot._id);
        console.log("Request status:", lot.requestStatus);
        console.log("Requested by:", lot.requestedBy);
        console.log("Collector:", lot.collector);

        if (lot.requestStatus !== "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message: "Recycler request must be accepted first"
            });
        }

        if (lot.requestedBy?.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the accepted recycler can complete handover"
            });
        }

        if (lot.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "Scrap lot is no longer available"
            });
        }

        const receiptNo =
            "ECO-" + Date.now().toString().slice(-8);

        // 1. Create handover
        const handover = await Handover.create({
            scrapLot: lot._id,
            collector: lot.collector,
            recycler: lot.requestedBy,
            material: lot.material,
            weight: lot.weight,
            finalAmount: lot.indicativePrice,
            receiptNo,
            status: "COMPLETED",

            // 📍 GPS proof
            latitude:
                latitude !== undefined && latitude !== null
                    ? Number(latitude)
                    : null,

            longitude:
                longitude !== undefined && longitude !== null
                    ? Number(longitude)
                    : null,

            // 📸 Photo proof
            photoUrl: photoUrl || ""
        });

        console.log("1. Handover created:", handover._id);
        console.log("GPS:", latitude, longitude);
        console.log("Photo:", photoUrl ? "YES" : "NO");

        // 2. Mark lot as handed over
        lot.status = "HANDED_OVER";
        await lot.save();

        console.log("2. Scrap lot marked HANDED_OVER");

        // 3. Create transaction
        const transaction = await Transaction.create({
            scrapLot: lot._id,
            collector: lot.collector,
            recycler: lot.requestedBy,
            material: lot.material,
            weight: lot.weight,
            amount: lot.indicativePrice,
            receiptNo,
            status: "COMPLETED"
        });

        console.log("3. Transaction created:", transaction._id);

        // 4. CREATE TRACEABILITY RECORD
        const trace = await Trace.create({
            scrapLot: lot._id,
            actor: lot.requestedBy,
            stage: "SENT_TO_RECYCLER",
            note: `Scrap handover completed. Receipt: ${receiptNo}`
        });

        console.log("4. TRACE CREATED:", trace._id);
        console.log("Trace stage:", trace.stage);
        console.log("Trace scrapLot:", trace.scrapLot);

        // 5. CREATE NOTIFICATIONS
        await Notification.create([
            {
                user: lot.collector,
                message:
                    `Scrap handover completed successfully. Receipt: ${receiptNo}`,
                type: "HANDOVER"
            },
            {
                user: lot.requestedBy,
                message:
                    `Your scrap purchase was completed successfully. Receipt: ${receiptNo}`,
                type: "HANDOVER"
            }
        ]);

        console.log("5. NOTIFICATIONS CREATED");
        console.log("========== HANDOVER COMPLETE ==========");

        res.json({
            success: true,
            message: "Scrap handover completed successfully",
            handover,
            transaction,
            trace
        });

    } catch (error) {
        console.error("========== HANDOVER ERROR ==========");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to complete handover",
            error: error.message
        });
    }
});

export default router;