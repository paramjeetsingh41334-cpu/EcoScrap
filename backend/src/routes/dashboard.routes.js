import { Router } from "express";
import Pickup from "../models/Pickup.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import RecyclingCertificate from "../models/RecyclingCertificate.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";

const r = Router();

/* =========================================================
   EXISTING DASHBOARD SUMMARY
========================================================= */

r.get("/summary", requireAuth, async (req, res, next) => {
    try {
        const role = req.user.role;

        const pickupMatch =
            role === "USER"
                ? { user: req.user._id }
                : role === "COLLECTOR"
                    ? { collector: req.user._id }
                    : {};

        const [pickupCount, pickupCompleted, pickupTotal] =
            await Promise.all([
                Pickup.countDocuments(pickupMatch),

                Pickup.countDocuments({
                    ...pickupMatch,
                    status: "COMPLETED"
                }),

                Pickup.aggregate([
                    {
                        $match: {
                            ...pickupMatch,
                            status: "COMPLETED"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            kg: {
                                $sum: "$actualWeight"
                            },
                            amount: {
                                $sum: "$finalAmount"
                            }
                        }
                    }
                ])
            ]);

        const pickupKg = pickupTotal[0]?.kg || 0;
        const pickupAmount = pickupTotal[0]?.amount || 0;

        let transactionMatch = null;

        if (role === "COLLECTOR") {
            transactionMatch = {
                collector: req.user._id,
                status: "COMPLETED"
            };
        } else if (role === "RECYCLER") {
            transactionMatch = {
                recycler: req.user._id,
                status: "COMPLETED"
            };
        }

        let transactionKg = 0;
        let transactionAmount = 0;

        if (transactionMatch) {
            const transactionTotal = await Transaction.aggregate([
                {
                    $match: transactionMatch
                },
                {
                    $group: {
                        _id: null,
                        kg: {
                            $sum: "$weight"
                        },
                        amount: {
                            $sum: "$amount"
                        }
                    }
                }
            ]);

            transactionKg = transactionTotal[0]?.kg || 0;
            transactionAmount = transactionTotal[0]?.amount || 0;
        }

        const totalKg = pickupKg + transactionKg;
        const totalAmount = pickupAmount + transactionAmount;

        const calculatedGreenCredits =
            Math.floor(totalKg * 10);

        const greenCredits = Math.max(
            req.user.greenCredits || 0,
            calculatedGreenCredits
        );

        res.json({
            pickups: pickupCount,
            completed: pickupCompleted,
            kg: totalKg,
            amount: totalAmount,
            greenCredits
        });

    } catch (error) {
        next(error);
    }
});


/* =========================================================
   ADVANCED ANALYTICS
========================================================= */

r.get("/analytics", requireAuth, async (req, res, next) => {
    try {
        const role = req.user.role;

        /* ---------------------------------------------
           ROLE-BASED TRANSACTION FILTER
        --------------------------------------------- */

        let transactionMatch = {
            status: "COMPLETED"
        };

        if (role === "COLLECTOR") {
            transactionMatch.collector = req.user._id;
        }

        if (role === "RECYCLER") {
            transactionMatch.recycler = req.user._id;
        }

        if (role === "USER" || role === "ORGANIZATION") {
            transactionMatch = {
                _id: null
            };
        }


        /* ---------------------------------------------
           BASIC TRANSACTION TOTALS
        --------------------------------------------- */

        const transactionTotals =
            await Transaction.aggregate([
                {
                    $match: transactionMatch
                },
                {
                    $group: {
                        _id: null,
                        totalWeight: {
                            $sum: "$weight"
                        },
                        totalAmount: {
                            $sum: "$amount"
                        },
                        totalTransactions: {
                            $sum: 1
                        }
                    }
                }
            ]);

        const totals = transactionTotals[0] || {
            totalWeight: 0,
            totalAmount: 0,
            totalTransactions: 0
        };


        /* ---------------------------------------------
           MATERIAL-WISE ANALYTICS
        --------------------------------------------- */

        const materialBreakdown =
            await Transaction.aggregate([
                {
                    $match: transactionMatch
                },

                {
                    $lookup: {
                        from: "scraps",
                        localField: "material",
                        foreignField: "_id",
                        as: "materialInfo"
                    }
                },

                {
                    $unwind: {
                        path: "$materialInfo",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $group: {
                        _id: "$materialInfo.name",
                        weight: {
                            $sum: "$weight"
                        },
                        amount: {
                            $sum: "$amount"
                        },
                        transactions: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        weight: -1
                    }
                }
            ]);


        /* ---------------------------------------------
           MONTHLY ACTIVITY
        --------------------------------------------- */

        const monthlyActivity =
            await Transaction.aggregate([
                {
                    $match: transactionMatch
                },

                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt"
                            },
                            month: {
                                $month: "$createdAt"
                            }
                        },

                        weight: {
                            $sum: "$weight"
                        },

                        amount: {
                            $sum: "$amount"
                        },

                        transactions: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]);


        /* ---------------------------------------------
           COMPLETED PICKUPS
        --------------------------------------------- */

        const pickupMatch =
            role === "USER"
                ? { user: req.user._id }
                : role === "COLLECTOR"
                    ? { collector: req.user._id }
                    : {};

        const completedPickups =
            await Pickup.countDocuments({
                ...pickupMatch,
                status: "COMPLETED"
            });


        /* ---------------------------------------------
           CERTIFICATES
        --------------------------------------------- */

        let certificateMatch = {};

        if (role === "RECYCLER") {
            certificateMatch.recycler = req.user._id;
        } else if (role === "COLLECTOR") {
            certificateMatch.collector = req.user._id;
        }

        const certificates =
            await RecyclingCertificate.countDocuments(
                certificateMatch
            );


        /* ---------------------------------------------
           ENVIRONMENTAL IMPACT
           
           Current project rule:
           10 Green Credits / kg
        --------------------------------------------- */

        const greenCredits =
            Math.floor(totals.totalWeight * 10);

        /*
          Simple estimated environmental impact.
          This is a project estimate, not a scientific
          measurement.
        */

        const estimatedCO2Saved =
            Number(
                (totals.totalWeight * 0.5).toFixed(2)
            );


        /* ---------------------------------------------
           RESPONSE
        --------------------------------------------- */

        res.json({
            success: true,

            overview: {
                totalWeight: totals.totalWeight,
                totalAmount: totals.totalAmount,
                totalTransactions: totals.totalTransactions,
                completedPickups,
                certificates,
                greenCredits,
                estimatedCO2Saved
            },

            materialBreakdown,

            monthlyActivity
        });

    } catch (error) {
        console.error("Analytics error:", error);
        next(error);
    }
});


/* =========================================================
   ADMIN USERS
========================================================= */

r.get(
    "/users",
    requireAuth,
    allowRoles("ADMIN"),
    async (_, res, next) => {
        try {
            res.json(
                await User.find()
                    .select("-passwordHash")
                    .sort("-createdAt")
            );
        } catch (error) {
            next(error);
        }
    }
);

export default r;