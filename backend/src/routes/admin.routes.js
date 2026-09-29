import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";

const r = Router();

/* =========================
   RECYCLER VERIFICATION
========================= */

r.get(
    "/recyclers",
    requireAuth,
    allowRoles("ADMIN"),
    async (req, res, next) => {
        try {
            const recyclers = await User.find({
                role: "RECYCLER"
            })
                .select("-passwordHash")
                .sort({ createdAt: -1 });

            res.json(recyclers);
        } catch (error) {
            next(error);
        }
    }
);

r.patch(
    "/recyclers/:id/verify",
    requireAuth,
    allowRoles("ADMIN"),
    async (req, res, next) => {
        try {
            const recycler = await User.findOne({
                _id: req.params.id,
                role: "RECYCLER"
            });

            if (!recycler) {
                return res.status(404).json({
                    success: false,
                    message: "Recycler not found"
                });
            }

            recycler.verified = !recycler.verified;

            await recycler.save();

            res.json({
                success: true,
                message: recycler.verified
                    ? "Recycler verified successfully"
                    : "Recycler verification removed",
                recycler
            });
        } catch (error) {
            next(error);
        }
    }
);


/* =========================
   SELLER VERIFICATION
========================= */

r.get(
    "/sellers",
    requireAuth,
    allowRoles("ADMIN"),
    async (req, res, next) => {
        try {
            const sellers = await User.find({
                role: {
                    $in: ["COLLECTOR", "ORGANIZATION"]
                }
            })
                .select("-passwordHash")
                .sort({ createdAt: -1 });

            res.json(sellers);
        } catch (error) {
            next(error);
        }
    }
);

r.patch(
    "/sellers/:id/verify",
    requireAuth,
    allowRoles("ADMIN"),
    async (req, res, next) => {
        try {
            const seller = await User.findOne({
                _id: req.params.id,
                role: {
                    $in: ["COLLECTOR", "ORGANIZATION"]
                }
            });

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: "Seller not found"
                });
            }

            seller.verified = !seller.verified;

            await seller.save();

            res.json({
                success: true,
                message: seller.verified
                    ? "Seller verified successfully"
                    : "Seller verification removed",
                seller
            });
        } catch (error) {
            next(error);
        }
    }
);

export default r;