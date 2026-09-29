import { Router } from "express";
import Auction from "../models/Auction.js";
import Scrap from "../models/Scrap.js";
import ScrapLot from "../models/ScrapLot.js";
import Transaction from "../models/Transaction.js";
import Trace from "../models/Trace.js";
import Notification from "../models/Notification.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { auctionIO } from "../sockets/index.js";

const r = Router();


// ======================================================
// CREATE AUCTION
// Collector / Organization
// ======================================================

r.post(
    "/",
    requireAuth,
    allowRoles("COLLECTOR", "ORGANIZATION"),
    async (req, res, next) => {
        try {
            const {
                title,
                material,
                estimatedKg,
                startingBid,
                endsAt
            } = req.body;

            const end = new Date(endsAt);

           const kg = Number(estimatedKg);

if (
    !title ||
    !material ||
    !Number.isFinite(kg) ||
    kg <= 0 ||
    Number(startingBid) < 0 ||
    Number.isNaN(end.getTime()) ||
    end <= new Date()
) {
    return res.status(400).json({
        message: "Invalid auction data"
    });
}

if (req.user.role === "ORGANIZATION" && kg < 50) {
    return res.status(400).json({
        message: "Organization auctions require at least 50 kg."
    });
}

            // Find the Scrap document using material name
            const scrap = await Scrap.findOne({
                name: {
                    $regex: `^${material}$`,
                    $options: "i"
                }
            });

            const auction = await Auction.create({
                creator: req.user._id,
                creatorRole: req.user.role,

                title,
                material,

                materialRef: scrap?._id || null,

                estimatedKg: kg,

                startingBid: Number(startingBid),
                currentBid: Number(startingBid),

                endsAt: end
            });

            res.status(201).json(auction);
        } catch (error) {
            next(error);
        }
    }
);


// ======================================================
// GET OPEN AUCTIONS
// ======================================================

r.get(
    "/",
    requireAuth,
    async (_, res, next) => {
        try {
           
            const auctions = await Auction.find({
                status: "OPEN"
            })
                .populate("creator", "name email role")
                .populate("materialRef", "name rate")
                .sort("endsAt");

            res.json(auctions);
        } catch (error) {
            next(error);
        }
    }
);
// ======================================================
// GET MY AUCTIONS
// Collector / Organization
// ======================================================

r.get(
    "/mine",
    requireAuth,
    allowRoles("COLLECTOR", "ORGANIZATION"),
    async (req, res, next) => {
        try {
            const auctions = await Auction.find({
                creator: req.user._id
            })
                .populate("winner", "name email role")
                .populate("materialRef", "name rate")
                .populate("transaction")
                .sort({ createdAt: -1 });

            res.json(auctions);
        } catch (error) {
            next(error);
        }
    }
);

// ======================================================
// GET WON AUCTIONS
// Recycler only
// ======================================================

r.get(
    "/won",
    requireAuth,
    allowRoles("RECYCLER"),
    async (req, res, next) => {
        try {
            const auctions = await Auction.find({
                status: "CLOSED",
                winner: req.user._id
            })
                .populate("creator", "name email role")
                .populate("materialRef", "name rate")
                .populate("transaction")
                .sort({ updatedAt: -1 });

            res.json(auctions);
        } catch (error) {
            next(error);
        }
    }
);

// ======================================================
// PLACE BID
// Recycler only
// ======================================================

r.post(
    "/:id/bid",
    requireAuth,
    allowRoles("RECYCLER"),
    async (req, res, next) => {
        try {
            const price = Number(req.body.pricePerKg);

            if (!Number.isFinite(price) || price <= 0) {
                return res.status(400).json({
                    message: "Invalid bid"
                });
            }

            const auction = await Auction.findOne({
                _id: req.params.id,
                status: "OPEN"
            });

            if (!auction) {
                return res.status(404).json({
                    message: "Auction closed/not found"
                });
            }

            if (auction.endsAt <= new Date()) {
                auction.status = "CLOSED";

                await auction.save();

                return res.status(409).json({
                    message: "Auction ended"
                });
            }

            if (price <= auction.currentBid) {
                return res.status(409).json({
                    message:
                        `Bid must be above ₹${auction.currentBid}/kg`
                });
            }

            auction.currentBid = price;

            auction.bids.push({
                bidder: req.user._id,
                pricePerKg: price
            });

            await auction.save();

            auctionIO()
                ?.to(`auction:${auction._id}`)
                .emit("auction:bid", {
                    auctionId: auction._id,
                    currentBid: price,
                    bidder: req.user.name
                });

            res.json(auction);

        } catch (error) {
            next(error);
        }
    }
);


// ======================================================
// CLOSE AUCTION
// Highest bidder becomes winner
// Creates Transaction + Trace + Notification
// ======================================================

r.post(
    "/:id/close",
    requireAuth,
    allowRoles("COLLECTOR", "ORGANIZATION", "ADMIN"),
    async (req, res, next) => {
        try {
            const auction = await Auction.findById(req.params.id);

            if (!auction) {
                return res.status(404).json({
                    message: "Auction not found"
                });
            }


            // ------------------------------------------
            // Permission check
            // ------------------------------------------

            if (
                req.user.role !== "ADMIN" &&
                String(auction.creator) !== String(req.user._id)
            ) {
                return res.status(403).json({
                    message: "Not allowed"
                });
            }


            // ------------------------------------------
            // Auction must have ended
            // ------------------------------------------

            if (
                auction.endsAt > new Date() &&
                req.user.role !== "ADMIN"
            ) {
                return res.status(400).json({
                    message: "Auction has not ended"
                });
            }


            // ------------------------------------------
            // Already closed
            // ------------------------------------------

            if (auction.status === "CLOSED" && auction.transaction) {
    return res.status(400).json({
        message: "Auction already processed"
    });
}


            // ------------------------------------------
            // Find highest bid
            // ------------------------------------------

            const winningBid = [...auction.bids].sort(
                (a, b) => b.pricePerKg - a.pricePerKg
            )[0];


            // ------------------------------------------
            // No bids
            // ------------------------------------------

            if (!winningBid) {
                auction.status = "CLOSED";
                auction.winner = null;

                await auction.save();

                return res.json({
                    message: "Auction closed with no bids",
                    auction
                });
            }


            // ------------------------------------------
            // Find / create ScrapLot
            // ------------------------------------------
let scrapLot = null;

if (auction.scrapLot) {
    scrapLot = await ScrapLot.findById(auction.scrapLot);
}

if (!scrapLot) {

    // --------------------------------------------------
    // Recover material for older auctions
    // --------------------------------------------------

    if (!auction.materialRef) {

        const materialName = String(auction.material || "").trim();

        const scrap = await Scrap.findOne({
            name: {
                $regex: `^${materialName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        });

        if (scrap) {
            auction.materialRef = scrap._id;
        }
    }

    // Still not found
    if (!auction.materialRef) {
        return res.status(400).json({
            message:
                `Material "${auction.material}" was not found in the Scrap price list.`
        });
    }

    // --------------------------------------------------
    // Create ScrapLot
    // --------------------------------------------------

    scrapLot = await ScrapLot.create({
        collector: auction.creator,
        material: auction.materialRef,
        weight: auction.estimatedKg,
        indicativePrice: winningBid.pricePerKg,
        description: auction.title,
        status: "HANDED_OVER",
        requestedBy: winningBid.bidder,
        requestStatus: "ACCEPTED"
    });

    auction.scrapLot = scrapLot._id;
}

            // ------------------------------------------
            // Calculate transaction amount
            // ------------------------------------------

            const amount =
                Number(auction.estimatedKg) *
                Number(winningBid.pricePerKg);


            // ------------------------------------------
            // Receipt number
            // ------------------------------------------

            const receiptNo =
                `ECO-${Date.now()}`;


            // ------------------------------------------
            // Create transaction
            // ------------------------------------------

            const transaction = await Transaction.create({
                scrapLot: scrapLot._id,

                collector: auction.creator,

                recycler: winningBid.bidder,

                material: auction.materialRef,

                weight: auction.estimatedKg,

                amount,

                receiptNo,

                status: "COMPLETED"
            });


            // ------------------------------------------
            // Create traceability record
            // ------------------------------------------

            await Trace.create({
                scrapLot: scrapLot._id,

                stage: "SENT_TO_RECYCLER",

                actor: winningBid.bidder,

                note:
                    `Auction ${auction.title} completed. ` +
                    `Winning bid: ₹${winningBid.pricePerKg}/kg.`
            });


            // ------------------------------------------
            // Notify winner
            // ------------------------------------------

            await Notification.create({
                user: winningBid.bidder,

                title: "Auction Won 🎉",

                message:
                    `You won "${auction.title}" at ` +
                    `₹${winningBid.pricePerKg}/kg. ` +
                    `Total amount: ₹${amount}.`
            });


            // ------------------------------------------
            // Update auction
            // ------------------------------------------

            auction.status = "CLOSED";

            auction.winner = winningBid.bidder;

            auction.transaction = transaction._id;

            await auction.save();


            // ------------------------------------------
            // Return complete result
            // ------------------------------------------

            res.json({
                message: "Auction closed successfully",

                auction,

                winner: winningBid.bidder,

                winningBid: winningBid.pricePerKg,

                amount,

                receiptNo,

                transaction,

                scrapLot
            });

        } catch (error) {
            next(error);
        }
    }
);


export default r;