import { Router } from "express";
import crypto from "crypto";

import Pickup from "../models/Pickup.js";
import Scrap from "../models/Scrap.js";
import User from "../models/User.js";
import Trace from "../models/Trace.js";
import Notification from "../models/Notification.js";
import { sendNotification } from "../services/notification.service.js";

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
    longitude
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
            latitude !== undefined && latitude !== null
                ? Number(latitude)
                : null,

        longitude:
            longitude !== undefined && longitude !== null
                ? Number(longitude)
                : null
    }
});

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

            // 🔔 Notify user
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

            // 🔔 Notify user about status
            if (req.body.status === "ON_WAY") {
                await Notification.create({
                    user: p.user,
                    message:
                        "🚚 Your collector is on the way.",
                    type: "PICKUP"
                });

                await sendNotification({
    phone: (await User.findById(p.user).select("phone")).phone,
    
    message: "🚚 Collector is on the way for your pickup.",
channels: ["WHATSAPP", "SMS", "IN_APP"]
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


            // 🌱 Green Credits
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


            // ♻️ Traceability
            await Trace.create({
                pickup: p._id,
                stage: "COLLECTED",
                actor: req.user._id,
                note:
                    `${weight} kg collected`
            });


            // 🔔 Notify user
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

            // Only the pickup owner can confirm payment
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
                    message: "Pickup must be completed before payment"
                });
            }

            if (p.paymentStatus === "PAID") {
                return res.status(400).json({
                    message: "Payment is already marked as paid"
                });
            }

            p.paymentStatus = "PAID";

            await p.save();

            await Notification.create({
                user: p.user,
                message:
                    `💰 Payment confirmed for ₹${p.finalAmount}. Receipt: ${p.receiptNo}`,
                type: "PAYMENT"
            });

            if (p.collector) {
                await Notification.create({
                    user: p.collector,
                    message:
                        `💰 Payment received for pickup ${p.receiptNo}. Amount: ₹${p.finalAmount}`,
                    type: "PAYMENT"
                });
            }

            res.json({
                success: true,
                message: "Payment marked as paid",
                pickup: p
            });

        } catch (e) {
            next(e);
        }
    }
);

// =====================================================
// SMART ROUTE OPTIMIZATION
// =====================================================

// =====================================================
// SMART ROUTE OPTIMIZATION
// =====================================================
// =====================================================
// SMART ROUTE OPTIMIZATION
// =====================================================

r.get(
    "/smart-route",
    requireAuth,
    allowRoles("COLLECTOR"),
    async (req, res, next) => {
        try {
            // -------------------------------------------------
            // 1. GET ACTIVE PICKUPS
            // -------------------------------------------------
            // ARRIVED pickups are removed from the recommended
            // route because the collector has already reached them.

            const pickups = await Pickup.find({
                collector: req.user._id,
                status: {
                    $in: ["ACCEPTED", "ON_WAY"]
                },
                "location.latitude": { $ne: null },
                "location.longitude": { $ne: null }
            })
                .populate("user", "name phone address")
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
                    startSource: "none",
                    routingSource: "none"
                });
            }

            // -------------------------------------------------
            // 2. HELPERS
            // -------------------------------------------------

            const validNumber = (value) =>
                Number.isFinite(Number(value));

            const haversineDistanceKm = (
                lat1,
                lon1,
                lat2,
                lon2
            ) => {
                const R = 6371;

                const dLat =
                    (lat2 - lat1) * Math.PI / 180;

                const dLon =
                    (lon2 - lon1) * Math.PI / 180;

                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(lat1 * Math.PI / 180) *
                    Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) ** 2;

                return (
                    2 *
                    R *
                    Math.asin(Math.sqrt(a))
                );
            };

            const parseTime = (value) => {
                if (!value) return null;

                const match = String(value).match(
                    /(\d{1,2}):(\d{2})\s*(AM|PM)/i
                );

                if (!match) return null;

                let hour = Number(match[1]);
                const minute = Number(match[2]);
                const period = match[3].toUpperCase();

                if (period === "AM" && hour === 12) {
                    hour = 0;
                }

                if (period === "PM" && hour !== 12) {
                    hour += 12;
                }

                return hour * 60 + minute;
            };

            const parseSlot = (slot) => {
                if (!slot) {
                    return {
                        start: null,
                        end: null
                    };
                }

                const matches = String(slot).match(
                    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
                );

                if (!matches) {
                    return {
                        start: parseTime(slot),
                        end: null
                    };
                }

                return {
                    start: parseTime(
                        `${matches[1]}:${matches[2]} ${matches[3]}`
                    ),
                    end: parseTime(
                        `${matches[4]}:${matches[5]} ${matches[6]}`
                    )
                };
            };

            // -------------------------------------------------
            // 3. COLLECTOR CURRENT LOCATION
            // -------------------------------------------------

            const requestedLat =
                validNumber(req.query.latitude)
                    ? Number(req.query.latitude)
                    : null;

            const requestedLng =
                validNumber(req.query.longitude)
                    ? Number(req.query.longitude)
                    : null;

            const clientMinutes =
                validNumber(req.query.clientMinutes)
                    ? Number(req.query.clientMinutes)
                    : (
                        new Date().getHours() * 60 +
                        new Date().getMinutes()
                    );

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
                currentLat = requestedLat;
                currentLng = requestedLng;
                startSource = "collector-location";
            } else {
                currentLat =
                    Number(pickups[0].location.latitude);

                currentLng =
                    Number(pickups[0].location.longitude);

                startSource =
                    "first-pickup-fallback";
            }

            // -------------------------------------------------
            // 4. PREPARE COORDINATES
            // -------------------------------------------------

            const coordinates = [
                {
                    latitude: currentLat,
                    longitude: currentLng
                },
                ...pickups.map((pickup) => ({
                    latitude:
                        Number(pickup.location.latitude),
                    longitude:
                        Number(pickup.location.longitude)
                }))
            ];

            // -------------------------------------------------
            // 5. GET ROAD DISTANCE + ROAD TIME FROM OSRM
            // -------------------------------------------------
            //
            // OSRM Table API returns a matrix containing
            // road-network distance in meters and duration
            // in seconds between all supplied coordinates.
            //
            // Coordinate format:
            // longitude,latitude
            //
            // If OSRM is unavailable, we fall back to
            // Haversine distance so the feature does not break.

            let routingSource = "OSRM road routing";
            let distanceMatrix = null;
            let durationMatrix = null;

            try {
                const coordinateString =
                    coordinates
                        .map(
                            (point) =>
                                `${point.longitude},${point.latitude}`
                        )
                        .join(";");

                const osrmUrl =
                    `https://router.project-osrm.org/table/v1/driving/${coordinateString}` +
                    `?annotations=duration,distance`;

                const response =
                    await fetch(osrmUrl, {
                        headers: {
                            Accept: "application/json"
                        }
                    });

                if (!response.ok) {
                    throw new Error(
                        `OSRM HTTP ${response.status}`
                    );
                }

                const data = await response.json();

                if (
                    data.code !== "Ok" ||
                    !Array.isArray(data.distances) ||
                    !Array.isArray(data.durations)
                ) {
                    throw new Error(
                        "Invalid OSRM routing response"
                    );
                }

                distanceMatrix = data.distances;
                durationMatrix = data.durations;
            } catch (routingError) {
                console.warn(
                    "OSRM unavailable, using fallback distance:",
                    routingError.message
                );

                routingSource =
                    "Haversine fallback";

                distanceMatrix = coordinates.map(
                    (from) =>
                        coordinates.map(
                            (to) =>
                                haversineDistanceKm(
                                    from.latitude,
                                    from.longitude,
                                    to.latitude,
                                    to.longitude
                                ) * 1000
                        )
                );

                // Fallback average urban speed.
                durationMatrix = distanceMatrix.map(
                    (row) =>
                        row.map(
                            (meters) =>
                                (meters / 22000) * 3600
                        )
                );
            }

            // -------------------------------------------------
            // 6. PREPARE PICKUPS WITH TIME SLOTS
            // -------------------------------------------------

            const remaining = pickups.map(
                (pickup, index) => {
                    const slot = parseSlot(
                        pickup.slot
                    );

                    return {
                        pickup,
                        matrixIndex: index + 1,
                        slotStart: slot.start,
                        slotEnd: slot.end
                    };
                }
            );

            // -------------------------------------------------
            // 7. SMART ROUTE OPTIMIZATION
            // -------------------------------------------------
            //
            // Factors:
            //   - REAL ROAD travel time
            //   - REAL ROAD distance
            //   - pickup time slot
            //   - current time
            //   - previous pickup
            //
            // We use a greedy selection algorithm because it
            // is lightweight and suitable for a live dashboard.

            const route = [];

            let currentMatrixIndex = 0;
            let totalDistanceMeters = 0;
            let totalDrivingSeconds = 0;
            let currentTimeMinutes = clientMinutes;

            while (remaining.length > 0) {
                let bestIndex = 0;
                let bestScore = Infinity;
                let bestDistanceMeters = Infinity;
                let bestDurationSeconds = Infinity;

                remaining.forEach(
                    (candidate, index) => {
                        const matrixIndex =
                            candidate.matrixIndex;

                        let distanceMeters =
                            distanceMatrix?.[
                                currentMatrixIndex
                            ]?.[matrixIndex];

                        let durationSeconds =
                            durationMatrix?.[
                                currentMatrixIndex
                            ]?.[matrixIndex];

                        // If a matrix cell is unavailable,
                        // use straight-line fallback.
                        if (
                            !validNumber(distanceMeters)
                        ) {
                            distanceMeters =
                                haversineDistanceKm(
                                    coordinates[
                                        currentMatrixIndex
                                    ].latitude,
                                    coordinates[
                                        currentMatrixIndex
                                    ].longitude,
                                    coordinates[
                                        matrixIndex
                                    ].latitude,
                                    coordinates[
                                        matrixIndex
                                    ].longitude
                                ) * 1000;
                        }

                        if (
                            !validNumber(durationSeconds)
                        ) {
                            durationSeconds =
                                (distanceMeters / 22000) *
                                3600;
                        }

                        const travelMinutes =
                            durationSeconds / 60;

                        const arrivalTime =
                            currentTimeMinutes +
                            travelMinutes;

                        let score =
                            travelMinutes;

                        // -----------------------------------------
                        // TIME-SLOT INTELLIGENCE
                        // -----------------------------------------

                        if (
                            candidate.slotStart !== null
                        ) {
                            const start =
                                candidate.slotStart;

                            const end =
                                candidate.slotEnd;

                            // Pickup slot has already expired.
                            if (
                                end !== null &&
                                currentTimeMinutes > end
                            ) {
                                // Still allow it, but strongly
                                // prioritize it because it is late.
                                score -= 40;
                            }

                            // We can comfortably arrive before
                            // the slot starts.
                            else if (
                                arrivalTime < start
                            ) {
                                const waitingMinutes =
                                    start -
                                    arrivalTime;

                                // Prefer pickups whose slot is
                                // approaching, without ignoring
                                // distance.
                                if (
                                    waitingMinutes <= 30
                                ) {
                                    score -= 15;
                                } else if (
                                    waitingMinutes <= 90
                                ) {
                                    score -= 7;
                                }
                            }

                            // We arrive after the slot ends.
                            if (
                                end !== null &&
                                arrivalTime > end
                            ) {
                                const lateMinutes =
                                    arrivalTime - end;

                                score +=
                                    Math.min(
                                        60,
                                        lateMinutes * 3
                                    );
                            }

                            // We arrive during the valid window.
                            if (
                                end !== null &&
                                arrivalTime >= start &&
                                arrivalTime <= end
                            ) {
                                score -= 20;
                            }
                        }

                        // Small distance tie-breaker.
                        score +=
                            distanceMeters / 10000;

                        if (
                            score < bestScore ||
                            (
                                score === bestScore &&
                                distanceMeters <
                                    bestDistanceMeters
                            )
                        ) {
                            bestScore = score;
                            bestIndex = index;
                            bestDistanceMeters =
                                distanceMeters;
                            bestDurationSeconds =
                                durationSeconds;
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

                totalDistanceMeters +=
                    bestDistanceMeters;

                totalDrivingSeconds +=
                    bestDurationSeconds;

                currentTimeMinutes +=
                    bestDurationSeconds / 60;

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
                            pickup.location.latitude
                        ),

                    longitude:
                        Number(
                            pickup.location.longitude
                        ),

                    distanceFromPreviousKm:
                        Math.round(
                            (bestDistanceMeters / 1000) *
                            100
                        ) / 100,

                    travelTimeFromPreviousMinutes:
                        Math.max(
                            1,
                            Math.round(
                                bestDurationSeconds / 60
                            )
                        ),

                    items:
                        pickup.items.map(
                            (item) => ({
                                scrap:
                                    item.scrap
                                        ?.name ||
                                    "Scrap",

                                estimatedWeight:
                                    item.estimatedWeight
                            })
                        )
                });

                currentMatrixIndex =
                    next.matrixIndex;
            }

            // -------------------------------------------------
            // 8. FINAL TOTALS
            // -------------------------------------------------

            const totalDistanceKm =
                Math.round(
                    (totalDistanceMeters / 1000) *
                    100
                ) / 100;

            const drivingMinutes =
                Math.round(
                    totalDrivingSeconds / 60
                );

            // Keep 5 minutes handling time per pickup.
            const handlingMinutes =
                route.length * 5;

            const estimatedTimeMinutes =
                Math.max(
                    1,
                    drivingMinutes +
                    handlingMinutes
                );

            // -------------------------------------------------
            // 9. RESPONSE
            // -------------------------------------------------

            res.json({
                success: true,

                route,

                totalStops:
                    route.length,

                totalDistanceKm,

                estimatedTimeMinutes,

                drivingTimeMinutes:
                    drivingMinutes,

                handlingTimeMinutes:
                    handlingMinutes,

                startSource,

                routingSource,

                optimization:
                    "Road distance + road time + pickup time-slot awareness"
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
export default r;