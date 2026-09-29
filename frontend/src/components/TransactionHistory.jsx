import { useEffect, useState } from "react";
import { api } from "../api.js";

function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api("/transactions/mine")
            .then((data) => {
                setTransactions(data);
            })
            .catch((error) => {
                console.error(
                    "Transaction history error:",
                    error
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <section className="transaction-history-section">
            {/* HEADER */}
            <div className="transaction-history-header">
                <div>
                    <span className="transaction-history-eyebrow">
                        TRANSACTIONS
                    </span>

                    <h3>
                        <span className="transaction-header-icon">
                            📜
                        </span>

                        Transaction History
                    </h3>

                    <p>
                        View your completed recycling
                        transactions and receipts.
                    </p>
                </div>

                {!loading && transactions.length > 0 && (
                    <div className="transaction-count">
                        {transactions.length}{" "}
                        {transactions.length === 1
                            ? "Transaction"
                            : "Transactions"}
                    </div>
                )}
            </div>

            {/* LOADING */}
            {loading && (
                <div className="transaction-loading">
                    <div className="transaction-loading-icon">
                        📜
                    </div>

                    <p>Loading transactions...</p>
                </div>
            )}

            {/* EMPTY */}
            {!loading && transactions.length === 0 && (
                <div className="transaction-empty">
                    <div className="transaction-empty-icon">
                        📜
                    </div>

                    <h4>
                        No completed transactions yet
                    </h4>

                    <p>
                        Your completed recycling transactions
                        will appear here.
                    </p>
                </div>
            )}

            {/* TRANSACTIONS */}
            {!loading && transactions.length > 0 && (
                <div className="transaction-history-list">
                    {transactions.map((transaction) => (
                        <div
                            className="transaction-history-card"
                            key={transaction._id}
                        >
                            <div className="transaction-main">
                                <div className="transaction-receipt-icon">
                                    🧾
                                </div>

                                <div className="transaction-info">
                                    <strong>
                                        {transaction.receiptNo ||
                                            "Transaction"}
                                    </strong>

                                    <small>
                                        {new Date(
                                            transaction.createdAt
                                        ).toLocaleString()}
                                    </small>
                                </div>
                            </div>

                            <div className="transaction-details">
                                <div className="transaction-detail">
                                    <span>⚖️</span>

                                    <div>
                                        <small>
                                            Weight
                                        </small>

                                        <strong>
                                            {transaction.weight ||
                                                0}{" "}
                                            kg
                                        </strong>
                                    </div>
                                </div>

                                <div className="transaction-detail">
                                    <span>💰</span>

                                    <div>
                                        <small>
                                            Amount
                                        </small>

                                        <strong>
                                            ₹
                                            {transaction.amount ||
                                                0}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <span className="transaction-status">
                                ✓ COMPLETED
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default TransactionHistory;