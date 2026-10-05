import { useEffect, useState } from "react";
import { api } from "../api.js";

function AdminDashboard({ user, onLogout }) {
    const [activeSection, setActiveSection] = useState("dashboard");

    const [recyclers, setRecyclers] = useState([]);
    const [sellers, setSellers] = useState([]);

    const [loadingRecyclers, setLoadingRecyclers] = useState(true);
    const [loadingSellers, setLoadingSellers] = useState(true);

    const [message, setMessage] = useState("");

    const loadRecyclers = async () => {
        try {
            const data = await api("/admin/recyclers");
            setRecyclers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Recycler loading error:", error);
            setMessage(
                error.message || "Failed to load recyclers"
            );
        } finally {
            setLoadingRecyclers(false);
        }
    };

    const loadSellers = async () => {
        try {
            const data = await api("/admin/sellers");
            setSellers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Seller loading error:", error);
            setMessage(
                error.message || "Failed to load sellers"
            );
        } finally {
            setLoadingSellers(false);
        }
    };

    useEffect(() => {
        loadRecyclers();
        loadSellers();
    }, []);

    const toggleRecyclerVerification = async (id) => {
        try {
            await api(`/admin/recyclers/${id}/verify`, {
                method: "PATCH"
            });

            setMessage(
                "Recycler verification updated successfully."
            );

            await loadRecyclers();
        } catch (error) {
            setMessage(
                error.message || "Verification failed"
            );
        }
    };

    const toggleSellerVerification = async (id) => {
        try {
            await api(`/admin/sellers/${id}/verify`, {
                method: "PATCH"
            });

            setMessage(
                "Seller verification updated successfully."
            );

            await loadSellers();
        } catch (error) {
            setMessage(
                error.message || "Verification failed"
            );
        }
    };

    return (
        <div className="admin-dashboard-page">

            {/* TOPBAR */}
            <header className="admin-topbar">
                <div className="admin-brand">
                    <div className="admin-brand-icon">
                        ♻️
                    </div>

                    <div>
                        <h2>EcoScrap</h2>
                        <small>Admin Dashboard</small>
                    </div>
                </div>

                <div />
            </header>

            <main className="admin-dashboard-container">
                <div
                    className="admin-dashboard-layout"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "240px minmax(0, 1fr)",
                        gap: "24px",
                        alignItems: "start"
                    }}
                >
                    <aside
                        className="admin-sidebar"
                        style={{
                            position: "sticky",
                            top: "20px",
                            background: "#ffffff",
                            border: "1px solid #e5ece8",
                            borderRadius: "20px",
                            padding: "18px",
                            boxShadow: "0 10px 30px rgba(20,70,45,0.08)"
                        }}
                    >
                        <div style={{ marginBottom: "16px" }}>
                            <small style={{ color: "#6b7c74", fontWeight: 700 }}>ADMIN PANEL</small>
                            <h3 style={{ margin: "6px 0 0" }}>♻️ EcoScrap</h3>
                        </div>

                        <nav style={{ display: "grid", gap: "7px" }}>
                            {[
                                ["dashboard", "🏠", "Dashboard"],
                                ["sellers", "🏪", "Sellers"],
                                ["recyclers", "♻️", "Recyclers"],
                                ["verification", "🛡️", "Verification"]
                            ].map(([key, icon, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveSection(key)}
                                    style={{
                                        width: "100%",
                                        border: "0",
                                        borderRadius: "12px",
                                        padding: "12px 13px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        background: activeSection === key ? "#176b43" : "transparent",
                                        color: activeSection === key ? "#fff" : "#29443a"
                                    }}
                                >
                                    <span style={{ marginRight: "9px" }}>{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </nav>

                        <div style={{ marginTop: "18px", paddingTop: "15px", borderTop: "1px solid #e8efeb" }}>
                            <small style={{ color: "#718079" }}>Signed in as</small>
                            <strong style={{ display: "block", marginTop: "4px" }}>{user.name}</strong>

                            <button
                                type="button"
                                onClick={onLogout}
                                style={{
                                    width: "100%",
                                    marginTop: "14px",
                                    border: "1px solid #dce8e2",
                                    borderRadius: "12px",
                                    padding: "11px 13px",
                                    background: "#fff",
                                    color: "#b42318",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    textAlign: "left"
                                }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </aside>

                    <div className="admin-dashboard-content">

                {/* HERO */}
                <section className="admin-hero" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <div className="admin-hero-content">
                        <span className="admin-eyebrow">
                            ADMIN CONTROL CENTER
                        </span>

                        <h1>
                            <span className="admin-hero-icon">
                                🛡️
                            </span>
                            Admin Dashboard
                        </h1>

                        <p>
                            Manage and verify EcoScrap users
                            and trusted recycling partners.
                        </p>
                    </div>

                    <div className="admin-hero-badge">
                        <span>●</span>
                        System Admin
                    </div>
                </section>

                {/* MESSAGE */}
                {activeSection === "dashboard" && message && (
                    <div className="admin-message">
                        <span>✓</span>
                        <p>{message}</p>
                    </div>
                )}

                {/* OVERVIEW */}
                <div className="admin-overview" style={{ display: activeSection === "dashboard" ? "grid" : "none" }}>
                    <div className="admin-overview-card">
                        <div className="admin-overview-icon">
                            🏪
                        </div>

                        <div>
                            <small>
                                Total Sellers
                            </small>

                            <strong>
                                {loadingSellers
                                    ? "—"
                                    : sellers.length}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-overview-card">
                        <div className="admin-overview-icon">
                            ♻️
                        </div>

                        <div>
                            <small>
                                Total Recyclers
                            </small>

                            <strong>
                                {loadingRecyclers
                                    ? "—"
                                    : recyclers.length}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-overview-card">
                        <div className="admin-overview-icon">
                            ✓
                        </div>

                        <div>
                            <small>
                                Verified Sellers
                            </small>

                            <strong>
                                {loadingSellers
                                    ? "—"
                                    : sellers.filter(
                                          (seller) =>
                                              seller.verified
                                      ).length}
                            </strong>
                        </div>
                    </div>

                    <div className="admin-overview-card">
                        <div className="admin-overview-icon">
                            🛡️
                        </div>

                        <div>
                            <small>
                                Verified Recyclers
                            </small>

                            <strong>
                                {loadingRecyclers
                                    ? "—"
                                    : recyclers.filter(
                                          (recycler) =>
                                              recycler.verified
                                      ).length}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* SELLER VERIFICATION */}
                <section className="admin-verification-section" style={{ display: activeSection === "sellers" || activeSection === "verification" ? "block" : "none" }}>
                    <div className="admin-section-header">
                        <div>
                            <span className="admin-section-eyebrow">
                                MARKETPLACE TRUST
                            </span>

                            <h3>
                                <span className="admin-section-icon">
                                    🏪
                                </span>
                                Seller Verification
                            </h3>

                            <p>
                                Verify collectors and
                                organizations before they
                                sell recyclable materials.
                            </p>
                        </div>

                        {!loadingSellers && (
                            <span className="admin-section-count">
                                {sellers.length} Sellers
                            </span>
                        )}
                    </div>

                    {loadingSellers && (
                        <div className="admin-loading">
                            <div>🏪</div>
                            <p>Loading sellers...</p>
                        </div>
                    )}

                    {!loadingSellers &&
                        sellers.length === 0 && (
                            <div className="admin-empty">
                                <div>🏪</div>
                                <h4>No sellers found</h4>
                                <p>
                                    Seller accounts will
                                    appear here for
                                    verification.
                                </p>
                            </div>
                        )}

                    {!loadingSellers &&
                        sellers.length > 0 && (
                            <div className="admin-user-grid">
                                {sellers.map((seller) => (
                                    <div
                                        className="admin-user-card"
                                        key={seller._id}
                                    >
                                        <div className="admin-user-card-top">
                                            <div className="admin-user-avatar">
                                                {seller.role ===
                                                "COLLECTOR"
                                                    ? "🚚"
                                                    : "🏢"}
                                            </div>

                                            <div className="admin-user-heading">
                                                <h4>
                                                    {seller.name}
                                                </h4>

                                                <span>
                                                    {seller.role ===
                                                    "COLLECTOR"
                                                        ? "Collector"
                                                        : "Organization"}
                                                </span>
                                            </div>

                                            <span
                                                className={
                                                    seller.verified
                                                        ? "admin-verified-badge"
                                                        : "admin-pending-badge"
                                                }
                                            >
                                                {seller.verified
                                                    ? "✓ VERIFIED"
                                                    : "⏳ PENDING"}
                                            </span>
                                        </div>

                                        <div className="admin-user-details">
                                            <div>
                                                <span>
                                                    📞
                                                </span>

                                                <p>
                                                    <small>
                                                        Phone
                                                    </small>
                                                    <strong>
                                                        {
                                                            seller.phone
                                                        }
                                                    </strong>
                                                </p>
                                            </div>

                                            {seller.email && (
                                                <div>
                                                    <span>
                                                        📧
                                                    </span>

                                                    <p>
                                                        <small>
                                                            Email
                                                        </small>
                                                        <strong>
                                                            {
                                                                seller.email
                                                            }
                                                        </strong>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className={
                                                seller.verified
                                                    ? "admin-remove-button"
                                                    : "admin-verify-button"
                                            }
                                            onClick={() =>
                                                toggleSellerVerification(
                                                    seller._id
                                                )
                                            }
                                        >
                                            {seller.verified
                                                ? "Remove Verification"
                                                : "✓ Verify Seller"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                </section>

                {/* RECYCLER VERIFICATION */}
                <section className="admin-verification-section" style={{ display: activeSection === "recyclers" || activeSection === "verification" ? "block" : "none" }}>
                    <div className="admin-section-header">
                        <div>
                            <span className="admin-section-eyebrow">
                                RECYCLING NETWORK
                            </span>

                            <h3>
                                <span className="admin-section-icon">
                                    ♻️
                                </span>
                                Recycler Verification
                            </h3>

                            <p>
                                Manage verification status
                                for recycling partners.
                            </p>
                        </div>

                        {!loadingRecyclers && (
                            <span className="admin-section-count">
                                {recyclers.length} Recyclers
                            </span>
                        )}
                    </div>

                    {loadingRecyclers && (
                        <div className="admin-loading">
                            <div>♻️</div>
                            <p>Loading recyclers...</p>
                        </div>
                    )}

                    {!loadingRecyclers &&
                        recyclers.length === 0 && (
                            <div className="admin-empty">
                                <div>♻️</div>
                                <h4>No recyclers found</h4>
                                <p>
                                    Recycler accounts will
                                    appear here for
                                    verification.
                                </p>
                            </div>
                        )}

                    {!loadingRecyclers &&
                        recyclers.length > 0 && (
                            <div className="admin-user-grid">
                                {recyclers.map((recycler) => (
                                    <div
                                        className="admin-user-card"
                                        key={recycler._id}
                                    >
                                        <div className="admin-user-card-top">
                                            <div className="admin-user-avatar recycler-avatar">
                                                ♻️
                                            </div>

                                            <div className="admin-user-heading">
                                                <h4>
                                                    {
                                                        recycler.name
                                                    }
                                                </h4>

                                                <span>
                                                    Recycler
                                                </span>
                                            </div>

                                            <span
                                                className={
                                                    recycler.verified
                                                        ? "admin-verified-badge"
                                                        : "admin-pending-badge"
                                                }
                                            >
                                                {recycler.verified
                                                    ? "✓ VERIFIED"
                                                    : "⏳ PENDING"}
                                            </span>
                                        </div>

                                        <div className="admin-user-details">
                                            <div>
                                                <span>
                                                    📞
                                                </span>

                                                <p>
                                                    <small>
                                                        Phone
                                                    </small>
                                                    <strong>
                                                        {
                                                            recycler.phone
                                                        }
                                                    </strong>
                                                </p>
                                            </div>

                                            {recycler.email && (
                                                <div>
                                                    <span>
                                                        📧
                                                    </span>

                                                    <p>
                                                        <small>
                                                            Email
                                                        </small>
                                                        <strong>
                                                            {
                                                                recycler.email
                                                            }
                                                        </strong>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className={
                                                recycler.verified
                                                    ? "admin-remove-button"
                                                    : "admin-verify-button"
                                            }
                                            onClick={() =>
                                                toggleRecyclerVerification(
                                                    recycler._id
                                                )
                                            }
                                        >
                                            {recycler.verified
                                                ? "Remove Verification"
                                                : "✓ Verify Recycler"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;