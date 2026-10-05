import { useEffect, useState } from "react";
import { api } from "../api.js";

import RecyclerMarketplace from "../components/RecyclerMarketplace.jsx";
import PurchaseRequests from "../components/PurchaseRequests.jsx";
import MyPurchaseRequests from "../components/MyPurchaseRequests.jsx";
import WasteTraceability from "../components/WasteTraceability.jsx";
import Notifications from "../components/Notifications.jsx";
import TransactionHistory from "../components/TransactionHistory.jsx";
import LiveAuctions from "../components/LiveAuctions.jsx";
import WonAuctions from "../components/WonAuctions.jsx";
import { useLanguage } from "../i18n.jsx";
import RecyclingCertificates from "../components/RecyclingCertificates.jsx";
import AdvancedAnalytics from "../components/AdvancedAnalytics.jsx";

function RecyclerDashboard({ user, onLogout }) {
    const [activeSection, setActiveSection] = useState("dashboard");

    const [summary, setSummary] = useState(null);
    const [scrapLots, setScrapLots] = useState([]);
    const [loadingLots, setLoadingLots] = useState(true);

    const { t } = useLanguage();

    const loadData = async () => {
        try {
            const summaryData = await api("/dashboard/summary");
            setSummary(summaryData);
        } catch (error) {
            console.error("Recycler summary error:", error);
        }

        try {
            const data = await api("/scrap-lots");
            setScrapLots(data.lots || []);
        } catch (error) {
            console.error("Recycler scrap lots error:", error);
        } finally {
            setLoadingLots(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="app">
            <header>
                <div>
                    <b>♻️ {t("appName")}</b>
                    <span className="role">{user.role}</span>
                </div>
            </header>

            <main>
                <div className="recycler-dashboard-layout" style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: "24px", alignItems: "start" }}>
                    <aside className="recycler-sidebar" style={{ position: "sticky", top: "20px", background: "#fff", border: "1px solid #e5ece8", borderRadius: "20px", padding: "18px", boxShadow: "0 10px 30px rgba(20,70,45,0.08)" }}>
                        <div style={{ marginBottom: "16px" }}>
                            <small style={{ color: "#6b7c74", fontWeight: 700 }}>RECYCLER PANEL</small>
                            <h3 style={{ margin: "6px 0 0" }}>♻️ EcoScrap</h3>
                        </div>
                        <nav style={{ display: "grid", gap: "7px" }}>
                            {[
                                ["dashboard", "🏠", "Dashboard"],
                                ["scrap-lots", "📦", "Scrap Lots"],
                                ["auctions", "🔨", "Live Auctions"],
                                ["marketplace", "🛒", "Marketplace"],
                                ["purchase-requests", "📥", "Purchase Requests"],
                                ["traceability", "🔗", "Traceability"],
                                ["transactions", "💳", "Transactions"],
                                ["certificates", "🏆", "Certificates"],
                                ["analytics", "📊", "Analytics"],
                                ["notifications", "🔔", "Notifications"]
                            ].map(([key, icon, label]) => (
                                <button key={key} type="button" onClick={() => setActiveSection(key)}
                                    style={{ width: "100%", border: "0", borderRadius: "12px", padding: "12px 13px", textAlign: "left", cursor: "pointer", fontWeight: 700, background: activeSection === key ? "#176b43" : "transparent", color: activeSection === key ? "#fff" : "#29443a" }}>
                                    <span style={{ marginRight: "9px" }}>{icon}</span>{label}
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
                                🚪 {t("logout")}
                            </button>
                        </div>
                    </aside>

                    <div className="recycler-dashboard-content">

                <section className="hero" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <h2>
                        {t("welcome")}, {user.name}
                    </h2>

                    <p>
                        {t("recyclerDescription")}
                    </p>
                </section>

                <div className="cards" style={{ display: activeSection === "dashboard" ? "grid" : "none" }}>
                    <div className="card">
                        <small>
                            {t("availableLots")}
                        </small>
                        <strong>
                            {scrapLots.length}
                        </strong>
                    </div>

                    <div className="card">
                        <small>
                            {t("completed")}
                        </small>
                        <strong>
                            {summary?.completed || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>
                            {t("recycledKg")}
                        </small>
                        <strong>
                            {summary?.kg || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>
                            {t("transactions")} (₹)
                        </small>
                        <strong>
                            {summary?.amount || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>
                            {t("greenCredits")}
                        </small>
                        <strong>
                            {Math.floor(
                                (summary?.kg || 0) * 10
                            )}
                        </strong>
                    </div>
                </div>

                {/* Environmental Impact */}

                <section className="panel impact-panel" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <h3>
                        🌍 {t("environmentalImpact")}
                    </h3>

                    <div className="impact-grid">
                        <div className="impact-item">
                            <span>♻️</span>

                            <strong>
                                {summary?.kg || 0} kg
                            </strong>

                            <small>
                                {t("wasteRecycled")}
                            </small>
                        </div>

                        <div className="impact-item">
                            <span>🌱</span>

                            <strong>
                                {Math.floor(
                                    (summary?.kg || 0) * 10
                                )}
                            </strong>

                            <small>
                                {t("greenCredits")}
                            </small>
                        </div>

                        <div className="impact-item">
                            <span>🌳</span>

                            <strong>
                                {(
                                    (summary?.kg || 0) /
                                    100
                                ).toFixed(1)}
                            </strong>

                            <small>
                                {t("treeEquivalent")}
                            </small>
                        </div>

                        <div className="impact-item">
                            <span>💧</span>

                            <strong>
                                {(
                                    (summary?.kg || 0) *
                                    10
                                ).toFixed(0)}{" "}
                                L
                            </strong>

                            <small>
                                {t("waterSaving")}
                            </small>
                        </div>
                    </div>

                    <p className="impact-message">
                        🌎 {t("environmentalMessage")}
                    </p>
                </section>

                <div style={{ display: activeSection === "notifications" ? "block" : "none" }}><Notifications /></div>

                <section className="panel" style={{ display: activeSection === "scrap-lots" ? "block" : "none" }}>
                    <h3>
                        📦 {t("availableDigitalLots")}
                    </h3>

                    {loadingLots ? (
                        <p>
                            {t("loadingLots")}
                        </p>
                    ) : scrapLots.length === 0 ? (
                        <p>
                            {t("noDigitalLots")}
                        </p>
                    ) : (
                        <div className="pickup-list">
                            {scrapLots.map((lot) => (
                                <div
                                    className="pickup-card"
                                    key={lot._id}
                                >
                                    <h4>
                                        ♻️{" "}
                                        {lot.material?.name ||
                                            t("scrap")}
                                    </h4>

                                    <p>
                                        ⚖️{" "}
                                        {t("weight")}:{" "}
                                        <strong>
                                            {lot.weight} kg
                                        </strong>
                                    </p>

                                    <p>
                                        💰{" "}
                                        {t("indicativeValue")}:{" "}
                                        <strong>
                                            ₹
                                            {
                                                lot.indicativePrice
                                            }
                                        </strong>
                                    </p>

                                    {lot.description && (
                                        <p>
                                            📝{" "}
                                            {lot.description}
                                        </p>
                                    )}

                                    {lot.collector && (
                                        <p>
                                            👷{" "}
                                            {t("collector")}:{" "}
                                            {lot.collector.name ||
                                                t("collector")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div style={{ display: activeSection === "auctions" ? "block" : "none" }}><LiveAuctions /></div>

                <div style={{ display: activeSection === "auctions" ? "block" : "none" }}><WonAuctions /></div>

                <div style={{ display: activeSection === "marketplace" ? "block" : "none" }}><RecyclerMarketplace /></div>

                <div style={{ display: activeSection === "purchase-requests" ? "block" : "none" }}><PurchaseRequests /></div>

                <div style={{ display: activeSection === "purchase-requests" ? "block" : "none" }}><MyPurchaseRequests /></div>

                <div style={{ display: activeSection === "traceability" ? "block" : "none" }}><WasteTraceability /></div>

                <div style={{ display: activeSection === "transactions" ? "block" : "none" }}><TransactionHistory /></div>

                <div style={{ display: activeSection === "certificates" ? "block" : "none" }}><RecyclingCertificates /></div>

                <div style={{ display: activeSection === "analytics" ? "block" : "none" }}><AdvancedAnalytics /></div>

                <section className="panel" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <h3>
                        🚀 {t("recyclerFlow")}
                    </h3>

                    <div className="flow">
                        {t("findScrapLot")} →{" "}
                        {t("viewMaterial")} →{" "}
                        {t("request")} →{" "}
                        {t("collectorAccepts")} →{" "}
                        {t("handover")} →{" "}
                        {t("transaction")} →{" "}
                        {t("traceability")}
                    </div>
                </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RecyclerDashboard;