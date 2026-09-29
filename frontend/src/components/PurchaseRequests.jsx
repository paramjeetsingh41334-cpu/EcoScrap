import { useEffect, useState } from "react";
import { api } from "../api.js";

function PurchaseRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        try {
            const data = await api("/marketplace/requests/mine");
            setRequests(data);
        } catch (error) {
            console.error("Purchase requests error:", error);
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (id) => {
        try {
            await api(`/marketplace/${id}/accept`, {
                method: "PATCH"
            });

            await loadRequests();
        } catch (error) {
            alert(error.message);
        }
    };

    const rejectRequest = async (id) => {
        try {
            await api(`/marketplace/${id}/reject`, {
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
            <section className="seller-purchase-requests">
                <div className="seller-requests-loading">
                    <div className="seller-loading-icon">📩</div>
                    <p>Loading purchase requests...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="seller-purchase-requests">
            <div className="seller-requests-header">
                <div>
                    <span className="seller-requests-eyebrow">
                        MARKETPLACE
                    </span>

                    <h3>
                        <span className="seller-requests-header-icon">
                            📩
                        </span>
                        Purchase Requests
                    </h3>

                    <p>
                        Review and manage requests from recyclers.
                    </p>
                </div>

                {requests.length > 0 && (
                    <div className="seller-requests-count">
                        {requests.length}{" "}
                        {requests.length === 1 ? "Request" : "Requests"}
                    </div>
                )}
            </div>

            {requests.length === 0 && (
                <div className="seller-requests-empty">
                    <div className="seller-empty-icon">📩</div>

                    <h4>No pending purchase requests</h4>

                    <p>
                        New recycler purchase requests will appear here.
                    </p>
                </div>
            )}

            {requests.length > 0 && (
                <div className="seller-requests-grid">
                    {requests.map((request) => (
                        <div
                            className="seller-purchase-card"
                            key={request._id}
                        >
                            <div className="seller-purchase-top">
                                <div className="seller-material-icon">
                                    📦
                                </div>

                                <span className="seller-pending-status">
                                    PENDING
                                </span>
                            </div>

                            <div className="seller-purchase-main">
                                <h4>{request.material}</h4>

                                <div className="seller-purchase-price">
                                    <strong>
                                        ₹{request.askingPricePerKg}
                                    </strong>
                                    <span>/ kg</span>
                                </div>
                            </div>

                            <div className="seller-purchase-details">
                                <div className="seller-purchase-detail">
                                    <span className="seller-detail-icon">
                                        ⚖️
                                    </span>

                                    <div>
                                        <span>Quantity</span>
                                        <strong>
                                            {request.kg} kg
                                        </strong>
                                    </div>
                                </div>

                                <div className="seller-purchase-detail">
                                    <span className="seller-detail-icon">
                                        ♻️
                                    </span>

                                    <div>
                                        <span>Recycler</span>
                                        <strong>
                                            {request.recycler?.name ||
                                                "Unknown"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="seller-verification-row">
                                {request.recycler?.verified ? (
                                    <span className="seller-recycler-verified">
                                        ✅ Verified Recycler
                                    </span>
                                ) : (
                                    <span className="seller-recycler-unverified">
                                        ⏳ Recycler not verified
                                    </span>
                                )}
                            </div>

                            <div className="seller-request-actions">
                                <button
                                    className="seller-accept-button"
                                    onClick={() =>
                                        acceptRequest(request._id)
                                    }
                                >
                                    ✅ Accept
                                </button>

                                <button
                                    className="seller-reject-button"
                                    onClick={() =>
                                        rejectRequest(request._id)
                                    }
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default PurchaseRequests;