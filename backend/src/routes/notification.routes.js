import { Router } from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

// GET MY NOTIFICATIONS
r.get("/mine", requireAuth, async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id
        }).sort("-createdAt");

        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

// MARK ONE AS READ
r.patch("/:id/read", requireAuth, async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            {
                $set: {
                    read: true
                }
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json(notification);
    } catch (error) {
        next(error);
    }
});

// MARK ALL AS READ
r.patch("/read-all", requireAuth, async (req, res, next) => {
    try {
        await Notification.updateMany(
            {
                user: req.user.id,
                read: false
            },
            {
                $set: {
                    read: true
                }
            }
        );

        res.json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        next(error);
    }
});

export default r;