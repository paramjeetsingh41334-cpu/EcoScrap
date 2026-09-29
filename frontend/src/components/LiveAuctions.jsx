import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api.js";

const SOCKET_URL = "http://localhost:8000";

function LiveAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [bids, setBids] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let socket;

        const start = async () => {
            try {
                const data = await api("/auctions");
                const auctionList = Array.isArray(data) ? data : [];

                setAuctions(auctionList);

                socket = io(SOCKET_URL);

                socket.on("connect", () => {
                    console.log("Connected to auction server");

                    auctionList.forEach((auction) => {
                        socket.emit("auction:join", auction._id);
                    });
                });

                socket.on("auction:bid", (data) => {
                    console.log("Live bid received:", data);

                    setAuctions((current) =>
                        current.map((auction) =>
                            String(auction._id) ===
                            String(data.auctionId)
                                ? {
                                      ...auction,
                                      currentBid: data.currentBid
                                  }
                                : auction
                        )
                    );
                });

                socket.on("disconnect", () => {
                    console.log("Disconnected from auction server");
                });
            } catch (error) {
                setMessage(`❌ ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        start();

        return () => {
            if (socket) {
                auctions.forEach((auction) => {
                    socket.emit("auction:leave", auction._id);
                });

                socket.disconnect();
            }
        };
    }, []);

    const placeBid = async (auction) => {
        const price = Number(bids[auction._id]);

        if (!price || price <= auction.currentBid) {
            setMessage(
                `❌ Bid must be above ₹${auction.currentBid}/kg`
            );
            return;
        }

        try {
            const updated = await api(
                `/auctions/${auction._id}/bid`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        pricePerKg: price
                    })
                }
            );

            setAuctions((current) =>
                current.map((item) =>
                    item._id === updated._id
                        ? updated
                        : item
                )
            );

            setBids((current) => ({
                ...current,
                [auction._id]: ""
            }));

            setMessage("✅ Bid placed successfully!");
        } catch (error) {
            setMessage(`❌ ${error.message}`);
        }
    };

    if (loading) {
        return (
            <section className="live-auctions-section">

                <div className="live-auctions-header">

                    <div>
                        <span className="auction-eyebrow">
                            LIVE MARKETPLACE
                        </span>

                        <h3>Live Auctions</h3>

                        <p>
                            Bid on bulk scrap lots from verified sellers.
                        </p>
                    </div>

                    <div className="live-auctions-icon">
                        🔨
                    </div>

                </div>

                <div className="live-auctions-loading">
                    <div className="auction-spinner" />
                    <p>Loading live auctions...</p>
                </div>

            </section>
        );
    }

    return (
        <section className="live-auctions-section">

            {/* Header */}
            <div className="live-auctions-header">

                <div>
                    <span className="auction-eyebrow">
                        LIVE MARKETPLACE
                    </span>

                    <h3>Live Auctions</h3>

                    <p>
                        Bid on bulk scrap lots from verified sellers.
                    </p>
                </div>

                <div className="live-auctions-icon">
                    🔨
                </div>

            </div>

            {/* Message */}
            {message && (
                <div
                    className={`live-auction-message ${
                        message.startsWith("❌")
                            ? "live-auction-message-error"
                            : "live-auction-message-success"
                    }`}
                >
                    {message}
                </div>
            )}

            {/* Empty */}
            {auctions.length === 0 ? (
                <div className="live-auctions-empty">

                    <div className="live-auctions-empty-icon">
                        🔨
                    </div>

                    <h4>No live auctions available</h4>

                    <p>
                        New scrap auctions will appear here when
                        sellers start bidding.
                    </p>

                </div>
            ) : (
                <div className="live-auctions-grid">

                    {auctions.map((auction) => (
                        <article
                            key={auction._id}
                            className="live-auction-card"
                        >

                            {/* Card Header */}
                            <div className="live-auction-card-header">

                                <div className="live-auction-title-wrap">

                                    <div className="live-auction-material-icon">
                                        ♻️
                                    </div>

                                    <div>
                                        <h4>{auction.title}</h4>

                                        <p>
                                            {auction.material}
                                        </p>
                                    </div>

                                </div>

                                <span className="live-auction-status">
                                    <span />
                                    LIVE
                                </span>

                            </div>

                            {/* Main Stats */}
                            <div className="live-auction-stats">

                                <div>
                                    <span>Estimated Weight</span>

                                    <strong>
                                        {auction.estimatedKg} kg
                                    </strong>
                                </div>

                                <div>
                                    <span>Current Bid</span>

                                    <strong className="live-auction-current-bid">
                                        ₹{auction.currentBid}/kg
                                    </strong>
                                </div>

                            </div>

                            {/* End Time */}
                            <div className="live-auction-end">

                                <span>⏰</span>

                                <div>
                                    <small>Auction ends</small>

                                    <strong>
                                        {new Date(
                                            auction.endsAt
                                        ).toLocaleString()}
                                    </strong>
                                </div>

                            </div>

                            {/* Bid Form */}
                            <div className="live-auction-bid-box">

                                <label>
                                    Your Bid
                                </label>

                                <div className="live-auction-bid-input">

                                    <span>₹</span>

                                    <input
                                        type="number"
                                        min={
                                            auction.currentBid + 0.01
                                        }
                                        step="0.01"
                                        placeholder={`Above ₹${auction.currentBid}`}
                                        value={
                                            bids[auction._id] || ""
                                        }
                                        onChange={(e) =>
                                            setBids((current) => ({
                                                ...current,
                                                [auction._id]:
                                                    e.target.value
                                            }))
                                        }
                                    />

                                    <small>/kg</small>

                                </div>

                                <button
                                    type="button"
                                    className="live-auction-bid-button"
                                    onClick={() =>
                                        placeBid(auction)
                                    }
                                >
                                    💰 Place Bid
                                </button>

                                <p className="live-auction-bid-hint">
                                    Your bid must be higher than the
                                    current bid.
                                </p>

                            </div>

                        </article>
                    ))}

                </div>
            )}

        </section>
    );
}

export default LiveAuctions;