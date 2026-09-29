import { Router } from "express";
import Marketplace from "../models/Marketplace.js";
import {
    requireAuth,
    allowRoles
} from "../middleware/auth.js";

const r = Router();

/* =========================
   MARKETPLACE LISTINGS
========================= */

r.get(
    "/",
    requireAuth,
    async (_, res, next) => {
        try {
            const listings = await Marketplace.find({
                status: "OPEN"
            })
                .populate("seller", "name verified role")
                .sort("-createdAt");

            res.json(listings);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   CREATE LISTING
   Seller = Collector / Organization
========================= */

r.post(
    "/",
    requireAuth,
    allowRoles("COLLECTOR", "ORGANIZATION"),
    async (req, res, next) => {
        try {
            const listing = await Marketplace.create({
                ...req.body,
                seller: req.user._id
            });

            res.status(201).json(listing);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   RECYCLER REQUESTS PURCHASE
========================= */

r.patch(
    "/:id/request",
    requireAuth,
    allowRoles("RECYCLER", "COLLECTOR"),
    async (req, res, next) => {
        try {
            const listing = await Marketplace.findOneAndUpdate(
                {
                    _id: req.params.id,
                    status: "OPEN"
                },
                {
                    $set: {
                        recycler: req.user._id,
                        requestStatus: "PENDING"
                    }
                },
                {
                    new: true
                }
            );

            if (!listing) {
                return res.status(409).json({
                    message: "Listing unavailable"
                });
            }

            res.json(listing);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   DIRECT BUY
========================= */

r.post(
    "/:id/buy",
    requireAuth,
    allowRoles("RECYCLER"),
    async (req, res, next) => {
        try {
            const listing = await Marketplace.findOneAndUpdate(
                {
                    _id: req.params.id,
                    status: "OPEN"
                },
                {
                    $set: {
                        status: "SOLD",
                        recycler: req.user._id
                    }
                },
                {
                    new: true
                }
            );

            if (!listing) {
                return res.status(409).json({
                    message: "Listing unavailable"
                });
            }

            res.json(listing);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   SELLER PURCHASE REQUESTS
   Includes Recycler Verification
========================= */

r.get(
    "/requests/mine",
    requireAuth,
    async (req, res, next) => {
        try {
            const requests = await Marketplace.find({
                seller: req.user._id,
                requestStatus: "PENDING"
            })
                .populate(
                    "recycler",
                    "name email verified"
                )
                .sort("-updatedAt");

            res.json(requests);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   RECYCLER SENT REQUESTS
========================= */

r.get(
    "/requests/sent",
    requireAuth,
    async (req, res, next) => {
        try {
            const requests = await Marketplace.find({
                recycler: req.user._id,
                requestStatus: {
                    $in: [
                        "PENDING",
                        "ACCEPTED",
                        "REJECTED"
                    ]
                }
            })
                .populate("seller", "name verified role")
                .sort("-updatedAt");

            res.json(requests);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   ACCEPT PURCHASE REQUEST
========================= */

r.patch(
    "/:id/accept",
    requireAuth,
    async (req, res, next) => {
        try {
            const listing = await Marketplace.findOneAndUpdate(
                {
                    _id: req.params.id,
                    seller: req.user._id,
                    requestStatus: "PENDING"
                },
                {
                    $set: {
                        requestStatus: "ACCEPTED"
                    }
                },
                {
                    new: true
                }
            );

            if (!listing) {
                return res.status(404).json({
                    message: "Purchase request not found"
                });
            }

            res.json(listing);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   REJECT PURCHASE REQUEST
========================= */

r.patch(
    "/:id/reject",
    requireAuth,
    async (req, res, next) => {
        try {
            const listing = await Marketplace.findOneAndUpdate(
                {
                    _id: req.params.id,
                    seller: req.user._id,
                    requestStatus: "PENDING"
                },
                {
                    $set: {
                        requestStatus: "REJECTED"
                    }
                },
                {
                    new: true
                }
            );

            if (!listing) {
                return res.status(404).json({
                    message: "Purchase request not found"
                });
            }

            res.json(listing);
        } catch (e) {
            next(e);
        }
    }
);


/* =========================
   RECYCLER COMPLETES PURCHASE
========================= */

r.patch(
    "/:id/complete",
    requireAuth,
    allowRoles("RECYCLER"),
    async (req, res, next) => {
        try {
            const listing = await Marketplace.findOneAndUpdate(
                {
                    _id: req.params.id,
                    recycler: req.user._id,
                    requestStatus: "ACCEPTED",
                    status: "OPEN"
                },
                {
                    $set: {
                        status: "SOLD"
                    }
                },
                {
                    new: true
                }
            );

            if (!listing) {
                return res.status(409).json({
                    message: "Purchase cannot be completed"
                });
            }

            res.json(listing);
        } catch (e) {
            next(e);
        }
    }
);

export default r;