import { useEffect, useState } from "react";
import { api } from "../api.js";

function MyPurchaseRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        try {
            const data = await api("/marketplace/requests/sent");
            setRequests(data);
        } catch (error) {
            console.error("My purchase requests error:", error);
        } finally {
            setLoading(false);
        }
    };

    // for transaction complete
    const completePurchase = async (id) => {
        try {
            await api(`/marketplace/${id}/complete`, {
                method: "PATCH"
            });

            await loadRequests();
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    if (loading) {
        return (
            <section className="purchase-requests-section">
                <div className="purchase-requests-loading">
                    <div className="purchase-loading-icon">🛒</div>
                    <p>Loading your purchase requests...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="purchase-requests-section">
            <div className="purchase-requests-header">
                <div>
                    <span className="purchase-requests-eyebrow">
                        MARKETPLACE
                    </span>

                    <h3>
                        <span className="purchase-header-icon">🛒</span>
                        My Purchase Requests
                    </h3>

                    <p>
                        Track the scrap listings you have requested to purchase.
                    </p>
                </div>

                {requests.length > 0 && (
                    <div className="purchase-requests-count">
                        {requests.length}{" "}
                        {requests.length === 1 ? "Request" : "Requests"}
                    </div>
                )}
            </div>

            {requests.length === 0 && (
                <div className="purchase-requests-empty">
                    <div className="purchase-empty-icon">🛒</div>

                    <h4>No purchase requests yet</h4>

                    <p>
                        Your marketplace purchase requests will appear here.
                    </p>
                </div>
            )}

            {requests.length > 0 && (
                <div className="purchase-requests-grid">
                    {requests.map((request) => (
                        <div
                            className="purchase-request-card"
                            key={request._id}
                        >
                            <div className="purchase-request-top">
                                <div className="purchase-request-material-icon">
                                    📦
                                </div>

                                <span
                                    className={`purchase-request-status status-${(
                                        request.requestStatus || ""
                                    ).toLowerCase()}`}
                                >
                                    {request.requestStatus}
                                </span>
                            </div>

                            <div className="purchase-request-main">
                                <h4>{request.material}</h4>

                                <div className="purchase-request-price">
                                    <strong>
                                        ₹{request.askingPricePerKg}
                                    </strong>
                                    <span>/ kg</span>
                                </div>
                            </div>

                            <div className="purchase-request-details">
                                <div className="purchase-request-detail">
                                    <span className="purchase-detail-icon">
                                        ⚖️
                                    </span>

                                    <div>
                                        <span>Quantity</span>
                                        <strong>{request.kg} kg</strong>
                                    </div>
                                </div>

                                <div className="purchase-request-detail">
                                    <span className="purchase-detail-icon">
                                        👤
                                    </span>

                                    <div>
                                        <span>Seller</span>
                                        <strong>
                                            {request.seller?.name || "Unknown"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="purchase-request-status-row">
                                <span>Request Status</span>

                                <strong>
                                    {request.requestStatus}
                                </strong>
                            </div>

                            {request.requestStatus === "ACCEPTED" &&
                                request.status === "OPEN" && (
                                    <button
                                        className="complete-purchase-button"
                                        onClick={() =>
                                            completePurchase(request._id)
                                        }
                                    >
                                        🛒 Complete Purchase
                                    </button>
                                )}

                            {request.requestStatus === "ACCEPTED" &&
                                request.status !== "OPEN" && (
                                    <div className="purchase-completed-note">
                                        ✓ Purchase completed
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default MyPurchaseRequests;