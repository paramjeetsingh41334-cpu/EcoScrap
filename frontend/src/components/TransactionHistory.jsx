import React, { useEffect, useState } from "react";
import { api } from "../api.js";

function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                // Completed pickups are the source of truth for the user's
                // digital recycling transactions and receipts.
                const data = await api("/pickups/mine");
                const pickups = Array.isArray(data)
                    ? data
                    : data?.pickups || [];

                setTransactions(
                    pickups.filter(
                        (pickup) => pickup.status === "COMPLETED"
                    )
                );
            } catch (err) {
                console.error("Transaction history error:", err);
                setError(err.message || "Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, []);

    return (
        <section className="card transaction-panel">
            <div className="transaction-history-header">
                <span className="section-eyebrow">TRANSACTIONS</span>
                <h2>🧾 Transaction History</h2>
                <p>View your completed recycling transactions and digital receipts.</p>
            </div>

            {loading && <p>Loading transactions...</p>}

            {error && (
                <p style={{ color: "#b42318", fontWeight: 600 }}>
                    Failed to load transactions: {error}
                </p>
            )}

            {!loading && !error && transactions.length === 0 && (
                <div className="transaction-empty-state">
                    <div style={{ fontSize: 42 }}>🧾</div>
                    <h3>No completed transactions yet</h3>
                    <p>
                        Complete a pickup to create your digital recycling
                        transaction and receipt.
                    </p>
                </div>
            )}

            {!loading && !error && transactions.length > 0 && (
                <div>
                    {transactions.map((pickup) => (
                        <article
                            className="transaction-card"
                            key={pickup._id}
                        >
                            <div>
                                <small>
                                    Receipt {pickup.receiptNo || "N/A"}
                                </small>
                                <h3>
                                    ♻️ Recycling Pickup #
                                    {String(pickup._id).slice(-6)}
                                </h3>

                                <p>
                                    📍 {pickup.address || "Pickup address"}
                                </p>

                                <p>
                                    ⚖️ Final Weight:{" "}
                                    <strong>
                                        {pickup.actualWeight || 0} kg
                                    </strong>
                                </p>

                                <p>
                                    💰 Final Amount:{" "}
                                    <strong>
                                        ₹{pickup.finalAmount || 0}
                                    </strong>
                                </p>

                                <p>
                                    💳 Payment:{" "}
                                    <strong>
                                        {pickup.paymentStatus || "PENDING"}
                                    </strong>
                                </p>

                                <small>
                                    {pickup.completedAt
                                        ? new Date(
                                              pickup.completedAt
                                          ).toLocaleString()
                                        : pickup.updatedAt
                                        ? new Date(
                                              pickup.updatedAt
                                          ).toLocaleString()
                                        : "Completed"}
                                </small>
                            </div>

                            <span
                                style={{
                                    padding: "7px 12px",
                                    borderRadius: "999px",
                                    background: "#e8f8ef",
                                    color: "#176b43",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap"
                                }}
                            >
                                ✓ COMPLETED
                            </span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default TransactionHistory;
