import express from "express";
import ScrapLot from "../models/ScrapLot.js";
import Scrap from "../models/Scrap.js";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// CREATE SCRAP LOT
router.post("/", requireAuth, async (req, res) => {
    try {
        const {
            material,
            weight,
            indicativePrice,
            photoUrl,
            description
        } = req.body;

        if (!material || !weight || indicativePrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Material, weight and indicative price are required"
            });
        }

        const scrap = await Scrap.findById(material);

        if (!scrap) {
            return res.status(404).json({
                success: false,
                message: "Scrap material not found"
            });
        }

        const lot = await ScrapLot.create({
            collector: req.user.id,
            material,
            weight,
            indicativePrice,
            photoUrl: photoUrl || "",
            description: description || ""
        });

        const populatedLot = await ScrapLot.findById(lot._id)
            .populate("material", "name rate")
            .populate("collector", "name email");

        res.status(201).json({
            success: true,
            message: "Scrap lot created successfully",
            lot: populatedLot
        });

    } catch (error) {
        console.error("Create scrap lot error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create scrap lot"
        });
    }
});


// GET AVAILABLE SCRAP LOTS
router.get("/", requireAuth, async (req, res) => {
    try {
        const lots = await ScrapLot.find({
            status: "AVAILABLE",
            $or: [
                {
                    requestedBy: null,
                    requestStatus: { $in: ["NONE", "REJECTED"] }
                },
                {
                    requestedBy: req.user.id,
                    requestStatus: "ACCEPTED"
                }
            ]
        })
            .populate("material", "name rate")
            .populate("collector", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            lots
        });

    } catch (error) {
        console.error("Get scrap lots error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch scrap lots"
        });
    }
});


// GET COLLECTOR'S SCRAP LOTS
router.get("/mine", requireAuth, async (req, res) => {
    try {
        const lots = await ScrapLot.find({
            collector: req.user.id,
            $or: [
                { requestStatus: "PENDING" },
                {
                    requestStatus: "NONE",
                    requestedBy: { $ne: null }
                }
            ]
        })
            .populate("material", "name rate")
            .populate("requestedBy", "name email phone verified")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            lots
        });

    } catch (error) {
        console.error("Get my scrap lots error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your scrap lots"
        });
    }
});


// RECYCLER REQUESTS SCRAP LOT
router.post("/:id/request", requireAuth, async (req, res) => {
    try {
        const lot = await ScrapLot.findById(req.params.id);

        if (!lot) {
            return res.status(404).json({
                success: false,
                message: "Scrap lot not found"
            });
        }

        if (lot.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "Scrap lot is no longer available"
            });
        }

        if (lot.requestedBy) {
            return res.status(400).json({
                success: false,
                message: "This scrap lot already has a request"
            });
        }

        lot.requestedBy = req.user.id;
        lot.requestStatus = "PENDING";

        await lot.save();

        await Notification.create({
    user: lot.collector,
    message: "A recycler has requested your scrap lot.",
    type: "MARKETPLACE"
});

        const updatedLot = await ScrapLot.findById(lot._id)
            .populate("material", "name rate")
            .populate("collector", "name email verified")
            .populate("requestedBy", "name email phone verified");

        res.json({
            success: true,
            message: "Recycler request sent successfully",
            lot: updatedLot
        });

    } catch (error) {
        console.error("Request scrap lot error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to request scrap lot"
        });
    }
});


// COLLECTOR ACCEPTS / REJECTS REQUEST
router.patch("/:id/request", requireAuth, async (req, res) => {
    try {
        const { action } = req.body;

        const lot = await ScrapLot.findById(req.params.id);

        if (!lot) {
            return res.status(404).json({
                success: false,
                message: "Scrap lot not found"
            });
        }

        if (lot.collector.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the collector can manage this request"
            });
        }

        if (!lot.requestedBy) {
            return res.status(400).json({
                success: false,
                message: "No recycler request found"
            });
        }

        if (action === "ACCEPT") {
            lot.requestStatus = "ACCEPTED";
        } else if (action === "REJECT") {
            lot.requestStatus = "REJECTED";
            lot.requestedBy = null;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        await lot.save();
//for notication
        await Notification.create({
    user: lot.requestedBy,
    message:
        action === "ACCEPT"
            ? "Your scrap lot request has been accepted by the collector."
            : "Your scrap lot request has been rejected by the collector.",
    type: "MARKETPLACE"
});

        const updatedLot = await ScrapLot.findById(lot._id)
            .populate("material", "name rate")
            .populate("collector", "name email")
            .populate("requestedBy", "name email phone");

        res.json({
            success: true,
            message:
                action === "ACCEPT"
                    ? "Recycler request accepted"
                    : "Recycler request rejected",
            lot: updatedLot
        });

    } catch (error) {
        console.error("Manage recycler request error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to manage recycler request"
        });
    }
});

export default router;