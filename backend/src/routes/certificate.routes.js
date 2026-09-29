import express from "express";
import RecyclingCertificate from "../models/RecyclingCertificate.js";
import Handover from "../models/Handover.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create certificate from completed handover
router.post("/generate/:handoverId", requireAuth, async (req, res) => {
    try {
        const handover = await Handover.findById(
            req.params.handoverId
        );

        if (!handover) {
            return res.status(404).json({
                success: false,
                message: "Handover not found"
            });
        }

        if (handover.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message:
                    "Certificate can only be generated after completed handover"
            });
        }

        // Only the recycler who completed the handover
        // or an admin can generate the certificate.
        if (
            req.user.role !== "ADMIN" &&
            String(handover.recycler) !== String(req.user._id)
        ) {
            return res.status(403).json({
                success: false,
                message: "Not allowed to generate this certificate"
            });
        }

        // Prevent duplicate certificates
        const existing = await RecyclingCertificate.findOne({
            handover: handover._id
        })
            .populate("material", "name rate unit")
            .populate("collector", "name email")
            .populate("recycler", "name email");

        if (existing) {
            return res.json({
                success: true,
                message: "Certificate already exists",
                certificate: existing
            });
        }

        const certificateNo =
            "ECO-CERT-" +
            Date.now().toString().slice(-8);

        const certificate =
            await RecyclingCertificate.create({
                certificateNo,
                handover: handover._id,
                scrapLot: handover.scrapLot,
                collector: handover.collector,
                recycler: handover.recycler,
                material: handover.material,
                weight: handover.weight,
                amount: handover.finalAmount,
                receiptNo: handover.receiptNo,
                verificationStatus: "VERIFIED"
            });

        const populatedCertificate =
            await RecyclingCertificate.findById(
                certificate._id
            )
                .populate("material", "name rate unit")
                .populate("collector", "name email")
                .populate("recycler", "name email")
                .populate("handover");

        res.status(201).json({
            success: true,
            message: "Recycling certificate generated successfully",
            certificate: populatedCertificate
        });

    } catch (error) {
        console.error(
            "Certificate generation error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate certificate"
        });
    }
});

// Get my certificates
router.get("/mine", requireAuth, async (req, res) => {
    try {
        const certificates = await RecyclingCertificate.find({
            $or: [
                { recycler: req.user._id },
                { collector: req.user._id }
            ]
        })
            .populate("material", "name rate unit")
            .populate("collector", "name email")
            .populate("recycler", "name email")
            .populate("handover")
            .sort("-certificateDate");

        res.json({
            success: true,
            certificates
        });

    } catch (error) {
        console.error("Certificate fetch error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch certificates"
        });
    }
});

export default router;