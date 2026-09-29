import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

function MyAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("ALL");

    const loadAuctions = async () => {
        try {
            const data = await api("/auctions/mine");
            setAuctions(Array.isArray(data) ? data : []);
        } catch (error) {
            setMessage(`❌ ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuctions();
    }, []);

    const closeAuction = async (auctionId) => {
        try {
            setMessage("");

            const result = await api(
                `/auctions/${auctionId}/close`,
                {
                    method: "POST"
                }
            );

            setMessage(
                `✅ Auction closed. Transaction: ${result.receiptNo}`
            );

            await loadAuctions();
        } catch (error) {
            setMessage(`❌ ${error.message}`);
        }
    };

    const isEnded = (endsAt) => {
        return new Date(endsAt) <= new Date();
    };

    const getAuctionState = (auction) => {
        if (auction.status === "CLOSED" || auction.transaction) {
            return "ENDED";
        }

        if (isEnded(auction.endsAt)) {
            return "ENDED";
        }

        return "LIVE";
    };

    const filteredAuctions = useMemo(() => {
        if (filter === "ALL") {
            return auctions;
        }

        return auctions.filter(
            (auction) => getAuctionState(auction) === filter
        );
    }, [auctions, filter]);

    if (loading) {
        return (
            <section className="auction-my-section">
                <div className="auction-page-header">
                    <div className="auction-page-heading">
                        <span className="auction-eyebrow">
                            MARKETPLACE
                        </span>

                        <h3>My Auctions</h3>

                        <p>
                            Manage your live and completed scrap auctions.
                        </p>
                    </div>

                    <div className="auction-page-icon">
                        📦
                    </div>
                </div>

                <div className="auction-loading-card">
                    <div className="auction-spinner" />
                    <p>Loading auctions...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="auction-my-section">

            {/* Header */}
            <div className="auction-page-header">

                <div className="auction-page-heading">

                    <span className="auction-eyebrow">
                        LIVE  MARKETPLACE
                    </span>

                    <h3>My Auctions</h3>

                    <p>
                        Manage your live and completed scrap auctions.
                    </p>

                </div>

                <div className="auction-header-side">

                    <div className="auction-total">
                        <strong>{auctions.length}</strong>
                        <span>Total</span>
                    </div>

                    <div className="auction-page-icon">
                        📦
                    </div>

                </div>

            </div>

            {/* Filters */}
            <div className="auction-filter-bar">
                {[
                    ["ALL", "All"],
                    ["LIVE", "Live"],
                    ["ENDED", "Ended"]
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        className={
                            filter === value
                                ? "auction-filter active"
                                : "auction-filter"
                        }
                        onClick={() => setFilter(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`auction-form-message ${
                        message.startsWith("❌")
                            ? "auction-message-error"
                            : "auction-message-success"
                    }`}
                >
                    {message}
                </div>
            )}

            {/* Empty */}
            {filteredAuctions.length === 0 ? (
                <div className="auction-empty-state">
                    <div>📦</div>

                    <h4>No auctions found</h4>

                    <p>
                        {filter === "ALL"
                            ? "You have not created any auctions yet."
                            : `There are no ${filter.toLowerCase()} auctions.`}
                    </p>
                </div>
            ) : (
                <div className="auction-card-grid">

                    {filteredAuctions.map((auction) => {

                        const ended = isEnded(auction.endsAt);
                        const state = getAuctionState(auction);
                        const hasWinner = Boolean(auction.winner);
                        const hasTransaction = Boolean(
                            auction.transaction
                        );
                        const bidCount = auction.bids?.length || 0;

                        return (
                            <article
                                className="auction-item-card"
                                key={auction._id}
                            >

                                {/* Auction Header */}
                                <div className="auction-item-top">

                                    <div className="auction-item-title-wrap">

                                        <div className="auction-material-icon">
                                            ♻️
                                        </div>

                                        <div>
                                            <h4>{auction.title}</h4>

                                            <p>
                                                {auction.material}
                                            </p>
                                        </div>

                                    </div>

                                    <span
                                        className={
                                            state === "LIVE"
                                                ? "auction-status live"
                                                : "auction-status ended"
                                        }
                                    >
                                        <span className="auction-status-dot" />

                                        {state === "LIVE"
                                            ? "LIVE"
                                            : "ENDED"}
                                    </span>

                                </div>

                                {/* Metrics */}
                                <div className="auction-metrics">

                                    <div className="auction-metric">
                                        <span>Weight</span>

                                        <strong>
                                            {auction.estimatedKg} kg
                                        </strong>
                                    </div>

                                    <div className="auction-metric">
                                        <span>Current Bid</span>

                                        <strong>
                                            ₹{auction.currentBid}/kg
                                        </strong>
                                    </div>

                                    <div className="auction-metric">
                                        <span>Bids</span>

                                        <strong>
                                            {bidCount}
                                        </strong>
                                    </div>

                                </div>

                                {/* Details */}
                                <div className="auction-item-details">

                                    <div>
                                        <span>Starting bid</span>

                                        <strong>
                                            ₹{auction.startingBid}/kg
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            {ended ? "Ended" : "Ends"}
                                        </span>

                                        <strong>
                                            {new Date(
                                                auction.endsAt
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                </div>

                                {/* Winner */}
                                {hasWinner && (
                                    <div className="auction-result winner">

                                        <span>🏆</span>

                                        <div>
                                            <small>Winner</small>

                                            <strong>
                                                {auction.winner.name ||
                                                    auction.winner.email}
                                            </strong>
                                        </div>

                                    </div>
                                )}

                                {/* Transaction */}
                                {hasTransaction && (
                                    <div className="auction-result transaction">

                                        <span>🧾</span>

                                        <div>
                                            <small>Transaction</small>

                                            <strong>
                                                {auction.transaction
                                                    .receiptNo ||
                                                    "Completed"}
                                            </strong>
                                        </div>

                                    </div>
                                )}

                                {/* Close Auction */}
                                {!hasTransaction && ended && (
                                    <button
                                        className="auction-close-button"
                                        type="button"
                                        onClick={() =>
                                            closeAuction(auction._id)
                                        }
                                    >
                                        🏆 Close & Select Winner
                                    </button>
                                )}

                                {/* Live */}
                                {!hasTransaction &&
                                    auction.status === "OPEN" &&
                                    !ended && (
                                        <div className="auction-live-note">

                                            <span>⏳</span>

                                            <span>
                                                Auction is live. You can
                                                close it after the end time.
                                            </span>

                                        </div>
                                    )}

                                {/* No bids */}
                                {auction.bids?.length === 0 && (
                                    <div className="auction-no-bids">
                                        No bids received yet.
                                    </div>
                                )}

                                {/* Completed */}
                                {auction.status === "CLOSED" &&
                                    hasTransaction && (
                                        <div className="auction-complete-note">
                                            ✓ Transaction and traceability
                                            completed.
                                        </div>
                                    )}

                            </article>
                        );
                    })}

                </div>
            )}

        </section>
    );
}

export default MyAuctions;