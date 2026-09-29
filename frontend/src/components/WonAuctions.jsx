import { useEffect, useState } from "react";
import { api } from "../api.js";

function WonAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api("/auctions/won")
            .then((data) => {
                setAuctions(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Won auctions error:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <section className="won-auctions-section">
            {/* HEADER */}
            <div className="won-auctions-header">
                <div>
                    <span className="won-auctions-eyebrow">
                        LIVE MARKETPLACE
                    </span>

                    <h3>
                        <span className="won-auctions-icon">
                            🏆
                        </span>
                        Auctions Won
                    </h3>

                    <p>
                        View auctions you won and their
                        completed transaction details.
                    </p>
                </div>

                {!loading && auctions.length > 0 && (
                    <div className="won-auctions-count">
                        {auctions.length}{" "}
                        {auctions.length === 1
                            ? "Auction"
                            : "Auctions"}
                    </div>
                )}
            </div>

            {/* LOADING */}
            {loading && (
                <div className="won-auctions-loading">
                    <div className="won-auctions-loading-icon">
                        🏆
                    </div>

                    <p>Loading won auctions...</p>
                </div>
            )}

            {/* EMPTY */}
            {!loading && auctions.length === 0 && (
                <div className="won-auctions-empty">
                    <div className="won-auctions-empty-icon">
                        🏆
                    </div>

                    <h4>
                        You have not won any auctions yet
                    </h4>

                    <p>
                        Your successful auction wins will
                        appear here.
                    </p>
                </div>
            )}

            {/* AUCTIONS */}
            {!loading && auctions.length > 0 && (
                <div className="won-auctions-grid">
                    {auctions.map((auction) => (
                        <article
                            className="won-auction-card"
                            key={auction._id}
                        >
                            {/* CARD TOP */}
                            <div className="won-auction-card-top">
                                <div className="won-auction-title-wrap">
                                    <div className="won-auction-material-icon">
                                        ♻️
                                    </div>

                                    <div>
                                        <span>
                                            AUCTION WON
                                        </span>

                                        <h4>
                                            {auction.title}
                                        </h4>
                                    </div>
                                </div>

                                <div className="won-auction-status">
                                    ✓ WON
                                </div>
                            </div>

                            {/* AUCTION DETAILS */}
                            <div className="won-auction-details">
                                <div className="won-auction-detail">
                                    <span>♻️</span>

                                    <div>
                                        <small>
                                            Material
                                        </small>

                                        <strong>
                                            {auction.materialRef
                                                ?.name ||
                                                auction.material}
                                        </strong>
                                    </div>
                                </div>

                                <div className="won-auction-detail">
                                    <span>⚖️</span>

                                    <div>
                                        <small>
                                            Weight
                                        </small>

                                        <strong>
                                            {
                                                auction.estimatedKg
                                            }{" "}
                                            kg
                                        </strong>
                                    </div>
                                </div>

                                <div className="won-auction-detail winning-bid-detail">
                                    <span>💰</span>

                                    <div>
                                        <small>
                                            Winning Bid
                                        </small>

                                        <strong>
                                            ₹
                                            {
                                                auction.currentBid
                                            }
                                            /kg
                                        </strong>
                                    </div>
                                </div>

                                <div className="won-auction-detail">
                                    <span>💵</span>

                                    <div>
                                        <small>
                                            Total Amount
                                        </small>

                                        <strong>
                                            ₹
                                            {auction.transaction
                                                ?.amount ||
                                                auction.estimatedKg *
                                                    auction.currentBid}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* SELLER */}
                            <div className="won-auction-seller">
                                <div className="seller-avatar">
                                    👤
                                </div>

                                <div>
                                    <small>
                                        Seller
                                    </small>

                                    <strong>
                                        {auction.creator
                                            ?.name ||
                                            "Organization"}
                                    </strong>
                                </div>

                                <span className="won-seller-status">
                                    VERIFIED
                                </span>
                            </div>

                            {/* RECEIPT */}
                            {auction.transaction && (
                                <div className="won-auction-receipt">
                                    <div className="won-receipt-header">
                                        <div className="won-receipt-icon">
                                            🧾
                                        </div>

                                        <div>
                                            <span>
                                                COMPLETED
                                                TRANSACTION
                                            </span>

                                            <h4>
                                                Transaction
                                                Receipt
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="won-receipt-details">
                                        <div>
                                            <small>
                                                Receipt No.
                                            </small>

                                            <strong>
                                                {
                                                    auction
                                                        .transaction
                                                        .receiptNo
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                Status
                                            </small>

                                            <strong className="receipt-completed">
                                                ✓ COMPLETED
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                Weight
                                            </small>

                                            <strong>
                                                {
                                                    auction
                                                        .transaction
                                                        .weight
                                                }{" "}
                                                kg
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                Amount
                                            </small>

                                            <strong>
                                                ₹
                                                {
                                                    auction
                                                        .transaction
                                                        .amount
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    {auction.transaction
                                        ?.scrapLot && (
                                        <button
                                            type="button"
                                            className="won-traceability-button"
                                            onClick={() => {
                                                const element =
                                                    document.getElementById(
                                                        `trace-${auction.transaction.scrapLot}`
                                                    );

                                                if (element) {
                                                    element.scrollIntoView(
                                                        {
                                                            behavior:
                                                                "smooth",
                                                            block:
                                                                "center"
                                                        }
                                                    );

                                                    element.style.border =
                                                        "3px solid #176b43";

                                                    setTimeout(
                                                        () => {
                                                            element.style.border =
                                                                "1px solid #e1ebe5";
                                                        },
                                                        2500
                                                    );
                                                }
                                            }}
                                        >
                                            ♻️ View Waste
                                            Traceability
                                            <span>→</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* SUCCESS */}
                            <div className="won-auction-success">
                                <span>✓</span>

                                <p>
                                    Auction won successfully.
                                    Transaction completed.
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default WonAuctions;