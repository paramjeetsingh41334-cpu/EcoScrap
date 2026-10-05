import { Router } from "express";
import crypto from "crypto";

import Pickup from "../models/Pickup.js";
import Scrap from "../models/Scrap.js";
import User from "../models/User.js";
import Trace from "../models/Trace.js";
import Notification from "../models/Notification.js";

import {
    requireAuth,
    allowRoles
} from "../middleware/auth.js";

const r = Router();


// =====================================================
// BOOK PICKUP
// =====================================================

r.post(
    "/",
    requireAuth,
    allowRoles("USER", "ORGANIZATION"),
    async (req, res, next) => {
        try {
            const {
                items,
                address,
                slot,
                latitude,
                longitude,
                segregation
            } = req.body;

            if (!Array.isArray(items) || !items.length) {
                return res.status(400).json({
                    message: "At least one scrap item required"
                });
            }

            const valid = await Scrap.find({
                _id: {
                    $in: items.map((x) => x.scrap)
                }
            });

            const map = new Map(
                valid.map((x) => [
                    x._id.toString(),
                    x
                ])
            );

            let estimate = 0;

            for (const i of items) {
                const s = map.get(
                    String(i.scrap)
                );

                if (
                    !s ||
                    i.estimatedWeight <= 0
                ) {
                    return res.status(400).json({
                        message: "Invalid scrap item"
                    });
                }

                estimate +=
                    s.rate * i.estimatedWeight;
            }

            const p = await Pickup.create({
                user: req.user._id,
                items,
                address,
                slot,
                location: {
                    latitude:
                        latitude !== undefined &&
                        latitude !== null
                            ? Number(latitude)
                            : null,

                    longitude:
                        longitude !== undefined &&
                        longitude !== null
                            ? Number(longitude)
                            : null
                }
            });

            // Save user's waste segregation information
            if (
                Array.isArray(segregation) &&
                segregation.length
            ) {
                p.set(
                    "segregation",
                    segregation,
                    { strict: false }
                );

                await p.save();
            }

            res.status(201).json({
                pickup: p,
                estimatedAmount: estimate
            });

        } catch (e) {
            next(e);
        }
    }
);


// =====================================================
// MY PICKUPS
// =====================================================

r.get(
    "/mine",
    requireAuth,
    async (req, res, next) => {
        try {
            const q =
                req.user.role === "COLLECTOR"
                    ? {
                        collector: req.user._id
                    }
                    : {
                        user: req.user._id
                    };

            const pickups = await Pickup.find(q)
                .populate(
                    "user collector items.scrap"
                )
                .sort("-createdAt");

            res.json(pickups);

        } catch (e) {
            next(e);
        }
    }
);


// =====================================================
// AVAILABLE PICKUPS FOR COLLECTOR
// =====================================================

r.get(
    "/available",
    requireAuth,
    allowRoles("COLLECTOR"),
    async (_, res, next) => {
        try {
            const pickups = await Pickup.find({
                status: "REQUESTED"
            })
                .populate(
                    "user items.scrap"
                )
                .sort("-createdAt");

            res.json(pickups);

        } catch (e) {
            next(e);
        }
    }
);


// =====================================================
// ACCEPT PICKUP
// =====================================================

r.patch(
    "/:id/accept",
    requireAuth,
    allowRoles("COLLECTOR"),
    async (req, res, next) => {
        try {
            const p =
                await Pickup.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        status: "REQUESTED"
                    },
                    {
                        $set: {
                            collector: req.user._id,
                            status: "ACCEPTED"
                        }
                    },
                    {
                        new: true
                    }
                );

            if (!p) {
                return res.status(409).json({
                    message:
                        "Pickup is no longer available"
                });
            }

            // Notify user
            await Notification.create({
                user: p.user,
                message:
                    "🚚 Your pickup has been accepted by a collector.",
                type: "PICKUP"
            });

            res.json(p);

        } catch (e) {
            next(e);
        }
    }
);


// =====================================================
// UPDATE PICKUP STATUS
// =====================================================

r.patch(
    "/:id/status",
    requireAuth,
    async (req, res, next) => {
        try {
            const allowed = [
                "ON_WAY",
                "ARRIVED",
                "CANCELLED"
            ];

            if (!allowed.includes(req.body.status)) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            const p = await Pickup.findById(
                req.params.id
            );

            if (!p) {
                return res.status(404).json({
                    message: "Pickup not found"
                });
            }

            if (
                String(p.collector) !==
                    String(req.user._id) &&
                req.user.role !== "ADMIN"
            ) {
                return res.status(403).json({
                    message: "Not allowed"
                });
            }

            p.status = req.body.status;

            await p.save();

            // Notify user
            if (req.body.status === "ON_WAY") {
                await Notification.create({
                    user: p.user,
                    message:
                        "🚚 Your collector is on the way.",
                    type: "PICKUP"
                });
            }

            if (req.body.status === "ARRIVED") {
                await Notification.create({
                    user: p.user,
                    message:
                        "📍 Your collector has arrived.",
                    type: "PICKUP"
                });
            }

            if (req.body.status === "CANCELLED") {
                await Notification.create({
                    user: p.user,
                    message:
                        "❌ Your pickup has been cancelled.",
                    type: "PICKUP"
                });
            }

            res.json(p);

        } catch (e) {
            next(e);
        }
    }
);


// =====================================================
// COMPLETE PICKUP
// =====================================================

r.patch(
    "/:id/complete",
    requireAuth,
    allowRoles("COLLECTOR", "ADMIN"),
    async (req, res, next) => {
        try {
            const p =
                await Pickup.findById(
                    req.params.id
                ).populate("items.scrap");

            if (!p) {
                return res.status(404).json({
                    message: "Pickup not found"
                });
            }

            if (
                req.user.role !== "ADMIN" &&
                String(p.collector) !==
                    String(req.user._id)
            ) {
                return res.status(403).json({
                    message: "Not allowed"
                });
            }

            const weight = Number(
                req.body.actualWeight
            );

            // Save collector's segregation
            // / actual categorized waste
            if (
                Array.isArray(req.body.segregation)
            ) {
                p.set(
                    "segregation",
                    req.body.segregation,
                    { strict: false }
                );
            }

            if (
                !Number.isFinite(weight) ||
                weight <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Valid actual weight required"
                });
            }

            const averageRate =
                p.items.reduce(
                    (sum, i) =>
                        sum + i.scrap.rate,
                    0
                ) /
                Math.max(
                    p.items.length,
                    1
                );

            p.actualWeight = weight;

            p.finalAmount =
                Math.round(
                    weight *
                    averageRate *
                    100
                ) / 100;

            p.status = "COMPLETED";

            p.paymentStatus = "PENDING";

            p.receiptNo =
                "KBD-" +
                crypto
                    .randomBytes(5)
                    .toString("hex")
                    .toUpperCase();

            await p.save();


            // Green Credits
            const credits =
                Math.floor(weight * 10);

            await User.findByIdAndUpdate(
                p.user,
                {
                    $inc: {
                        greenCredits: credits
                    }
                }
            );


            // Traceability
            await Trace.create({
                pickup: p._id,
                stage: "COLLECTED",
                actor: req.user._id,
                note:
                    `${weight} kg collected`
            });


            // Notify user
            await Notification.create({
                user: p.user,
                message:
                    `✅ Your pickup has been completed. ${weight} kg collected and your digital receipt is ready.`,
                type: "PICKUP"
            });


            res.json({
                pickup: p,
                greenCreditsEarned: credits
            });

        } catch (e) {
            next(e);
        }
    }
);


// =====================================================
// SMART ROUTE OPTIMIZATION
// =====================================================

r.get(
    "/smart-route",
    requireAuth,
    allowRoles("COLLECTOR"),
    async (req, res, next) => {
        try {
            const pickups = await Pickup.find({
                collector: req.user._id,
                status: {
                    $in: [
                        "ACCEPTED",
                        "ON_WAY",
                        "ARRIVED"
                    ]
                },
                "location.latitude": {
                    $ne: null
                },
                "location.longitude": {
                    $ne: null
                }
            })
                .populate(
                    "user",
                    "name phone address"
                )
                .populate("items.scrap");

            if (!pickups.length) {
                return res.json({
                    success: true,
                    message:
                        "Accept a pickup with location access to build your route.",
                    route: [],
                    totalStops: 0,
                    totalDistanceKm: 0,
                    estimatedTimeMinutes: 0,
                    startSource: "none"
                });
            }

            const validNumber = (value) =>
                Number.isFinite(Number(value));

            const distanceKm = (
                lat1,
                lon1,
                lat2,
                lon2
            ) => {
                const R = 6371;

                const dLat =
                    (lat2 - lat1) *
                    Math.PI /
                    180;

                const dLon =
                    (lon2 - lon1) *
                    Math.PI /
                    180;

                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(
                        lat1 *
                        Math.PI /
                        180
                    ) *
                    Math.cos(
                        lat2 *
                        Math.PI /
                        180
                    ) *
                    Math.sin(dLon / 2) ** 2;

                return (
                    2 *
                    R *
                    Math.asin(
                        Math.sqrt(a)
                    )
                );
            };

            const parseSlotStart = (slot) => {
                if (!slot) return 1440;

                const match =
                    String(slot).match(
                        /(\d{1,2}):(\d{2})\s*(AM|PM)/i
                    );

                if (!match) return 1440;

                let hour =
                    Number(match[1]);

                const minute =
                    Number(match[2]);

                const period =
                    match[3].toUpperCase();

                if (
                    period === "AM" &&
                    hour === 12
                ) {
                    hour = 0;
                }

                if (
                    period === "PM" &&
                    hour !== 12
                ) {
                    hour += 12;
                }

                return (
                    hour * 60 +
                    minute
                );
            };

            const clientMinutes =
                validNumber(
                    req.query.clientMinutes
                )
                    ? Number(
                        req.query.clientMinutes
                    )
                    : null;

            const requestedLat =
                validNumber(
                    req.query.latitude
                )
                    ? Number(
                        req.query.latitude
                    )
                    : null;

            const requestedLng =
                validNumber(
                    req.query.longitude
                )
                    ? Number(
                        req.query.longitude
                    )
                    : null;

            let currentLat;
            let currentLng;
            let startSource;

            if (
                requestedLat !== null &&
                requestedLng !== null &&
                requestedLat >= -90 &&
                requestedLat <= 90 &&
                requestedLng >= -180 &&
                requestedLng <= 180
            ) {
                currentLat =
                    requestedLat;

                currentLng =
                    requestedLng;

                startSource =
                    "collector-location";

            } else {
                currentLat =
                    Number(
                        pickups[0]
                            .location
                            .latitude
                    );

                currentLng =
                    Number(
                        pickups[0]
                            .location
                            .longitude
                    );

                startSource =
                    "first-pickup-fallback";
            }

            const remaining =
                pickups.map(
                    (pickup) => ({
                        pickup,
                        slotStart:
                            parseSlotStart(
                                pickup.slot
                            )
                    })
                );

            const route = [];

            let totalDistance = 0;

            let previousSlotStart =
                null;

            while (
                remaining.length > 0
            ) {
                let bestIndex = 0;

                let bestScore =
                    Infinity;

                let bestDistance =
                    Infinity;

                remaining.forEach(
                    (
                        candidate,
                        index
                    ) => {
                        const pickup =
                            candidate.pickup;

                        const lat =
                            Number(
                                pickup
                                    .location
                                    .latitude
                            );

                        const lng =
                            Number(
                                pickup
                                    .location
                                    .longitude
                            );

                        const distance =
                            distanceKm(
                                currentLat,
                                currentLng,
                                lat,
                                lng
                            );

                        let urgency = 0;

                        const slotStart =
                            candidate.slotStart;

                        if (
                            clientMinutes !==
                            null
                        ) {
                            const
                                minutesUntilSlot =
                                    slotStart -
                                    clientMinutes;

                            if (
                                minutesUntilSlot <=
                                30
                            ) {
                                urgency = -4;
                            } else if (
                                minutesUntilSlot <=
                                90
                            ) {
                                urgency = -2;
                            }
                        }

                        let slotPenalty = 0;

                        if (
                            previousSlotStart !==
                                null &&
                            slotStart <
                                previousSlotStart
                        ) {
                            slotPenalty =
                                1.5;
                        }

                        const score =
                            distance +
                            slotPenalty +
                            urgency;

                        if (
                            score <
                                bestScore ||
                            (
                                score ===
                                    bestScore &&
                                slotStart <
                                    remaining[
                                        bestIndex
                                    ].slotStart
                            )
                        ) {
                            bestScore =
                                score;

                            bestIndex =
                                index;

                            bestDistance =
                                distance;
                        }
                    }
                );

                const [next] =
                    remaining.splice(
                        bestIndex,
                        1
                    );

                const pickup =
                    next.pickup;

                totalDistance +=
                    bestDistance;

                route.push({
                    order:
                        route.length + 1,

                    pickupId:
                        pickup._id,

                    customer:
                        pickup.user?.name ||
                        "Customer",

                    phone:
                        pickup.user?.phone ||
                        "",

                    address:
                        pickup.address,

                    slot:
                        pickup.slot,

                    status:
                        pickup.status,

                    latitude:
                        Number(
                            pickup
                                .location
                                .latitude
                        ),

                    longitude:
                        Number(
                            pickup
                                .location
                                .longitude
                        ),

                    distanceFromPreviousKm:
                        Math.round(
                            bestDistance *
                            100
                        ) / 100,

                    items:
                        pickup.items.map(
                            (item) => ({
                                scrap:
                                    item
                                        .scrap
                                        ?.name ||
                                    "Scrap",

                                estimatedWeight:
                                    item
                                        .estimatedWeight
                            })
                        )
                });

                currentLat =
                    Number(
                        pickup
                            .location
                            .latitude
                    );

                currentLng =
                    Number(
                        pickup
                            .location
                            .longitude
                    );

                previousSlotStart =
                    next.slotStart;
            }

            totalDistance =
                Math.round(
                    totalDistance *
                    100
                ) / 100;

            // Planning estimate only:
            // urban average speed + 5 minutes per stop.
            const drivingMinutes =
                (
                    totalDistance /
                    22
                ) * 60;

            const handlingMinutes =
                route.length * 5;

            const estimatedTimeMinutes =
                Math.max(
                    1,
                    Math.round(
                        drivingMinutes +
                        handlingMinutes
                    )
                );

            res.json({
                success: true,
                route,
                totalStops:
                    route.length,

                totalDistanceKm:
                    totalDistance,

                estimatedTimeMinutes,

                startSource,

                optimization:
                    "Distance + pickup time-slot awareness"
            });

        } catch (error) {
            console.error(
                "Smart route error:",
                error
            );

            next(error);
        }
    }
);
// =====================================================
// CONFIRM PAYMENT
// =====================================================

r.patch(
    "/:id/pay",
    requireAuth,
    allowRoles("USER", "ORGANIZATION", "ADMIN"),
    async (req, res, next) => {
        try {
            const p = await Pickup.findById(req.params.id);

            if (!p) {
                return res.status(404).json({
                    message: "Pickup not found"
                });
            }

            if (
                req.user.role !== "ADMIN" &&
                String(p.user) !== String(req.user._id)
            ) {
                return res.status(403).json({
                    message: "Not allowed"
                });
            }

            if (p.status !== "COMPLETED") {
                return res.status(400).json({
                    message:
                        "Pickup must be completed before payment"
                });
            }

            if (p.paymentStatus === "PAID") {
                return res.status(400).json({
                    message:
                        "Payment is already marked as paid"
                });
            }

            p.paymentStatus = "PAID";

            await p.save();

            await Notification.create({
                user: p.user,
                message:
                    `💰 Payment confirmed for ₹${p.finalAmount}.`,
                type: "PAYMENT"
            });

            res.json({
                success: true,
                pickup: p
            });

        } catch (e) {
            next(e);
        }
    }
);

export default r;