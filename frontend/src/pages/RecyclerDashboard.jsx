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
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="app recycler-app">
            <header className="recycler-topbar">
                <button
                    type="button"
                    className="recycler-menu-button"
                    aria-label="Open recycler navigation"
                    aria-expanded={sidebarOpen}
                    onClick={() => setSidebarOpen(true)}
                >
                    ☰
                </button>
                <div className="recycler-brand-group">
                    <span className="recycler-brand-icon">♻️</span>
                    <div><b>{t("appName")}</b><small>Recycler workspace</small></div>
                    <span className="role">{user.role}</span>
                </div>
                <form className="recycler-search" role="search" onSubmit={(event) => {
                    event.preventDefault();
                    const query = search.trim().toLowerCase();
                    const pages = [
                        ["dashboard", "dashboard home"],
                        ["scrap-lots", "scrap lots available lots browse materials"],
                        ["auctions", "auctions live auctions won auctions bidding"],
                        ["marketplace", "marketplace listings"],
                        ["purchase-requests", "purchase requests orders"],
                        ["traceability", "traceability tracking"],
                        ["transactions", "transactions payments"],
                        ["certificates", "certificates recycling records"],
                        ["analytics", "analytics impact reports"],
                        ["notifications", "notifications alerts"]
                    ];
                    const match = pages.find(([, words]) => words.includes(query) || query.split(/\\s+/).some((part) => part && words.includes(part)));
                    if (match && query) setActiveSection(match[0]);
                    setSearchOpen(false);
                }}>
                    <span aria-hidden="true">🔍</span>
                    <input
                        type="search"
                        value={search}
                        placeholder="Search recycler features..."
                        aria-label="Search recycler features"
                        onFocus={() => setSearchOpen(true)}
                        onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }}
                        onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }}
                    />
                    {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setSearchOpen(false); }}>×</button>}
                    {searchOpen && search.trim() && (
                        <div className="recycler-search-results">
                            {[
                                ["dashboard", "🏠", "Dashboard"],
                                ["scrap-lots", "📦", "Browse Scrap Lots"],
                                ["auctions", "🔨", "Live Auctions"],
                                ["marketplace", "🛒", "Marketplace"],
                                ["purchase-requests", "📥", "Purchase Requests"],
                                ["traceability", "🔗", "Traceability"],
                                ["transactions", "💳", "Transactions"],
                                ["certificates", "🏆", "Certificates"],
                                ["analytics", "📊", "Analytics"],
                                ["notifications", "🔔", "Notifications"]
                            ].filter(([, , label]) => label.toLowerCase().includes(search.trim().toLowerCase())).map(([key, icon, label]) => (
                                <button key={key} type="button" onClick={() => { setActiveSection(key); setSearch(""); setSearchOpen(false); }}>
                                    <span>{icon}</span>{label}<span aria-hidden="true">→</span>
                                </button>
                            ))}
                            {![["Dashboard"],["Browse Scrap Lots"],["Live Auctions"],["Marketplace"],["Purchase Requests"],["Traceability"],["Transactions"],["Certificates"],["Analytics"],["Notifications"]].some(([label]) => label.toLowerCase().includes(search.trim().toLowerCase())) && <p>No matching features found.</p>}
                        </div>
                    )}
                </form>
                <button type="button" className="recycler-logout" onClick={onLogout}>↪ {t("logout")}</button>
            </header>

            {sidebarOpen && (
                <button
                    type="button"
                    className="recycler-sidebar-overlay"
                    aria-label="Close navigation menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <main className="recycler-main">
                <div className="recycler-dashboard-layout">
                    <aside className={`recycler-sidebar ${sidebarOpen ? "recycler-sidebar-open" : ""}`}>
                        <button
                            type="button"
                            className="recycler-sidebar-close"
                            aria-label="Close navigation menu"
                            onClick={() => setSidebarOpen(false)}
                        >
                            ✕
                        </button>
                        <div style={{ marginBottom: "16px" }}>
                            <small style={{ color: "#6b7c74", fontWeight: 700 }}>RECYCLER PANEL</small>
                            <h3 style={{ margin: "6px 0 0" }}>♻️ ScrapWala</h3>
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
                                <button key={key} type="button" onClick={() => { setActiveSection(key); setSidebarOpen(false); }}
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
                                ➜🚪 {t("logout")}
                            </button>
                        </div>
                    </aside>

                    <div className="recycler-dashboard-content">

                <section className="recycler-dashboard-overview" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <h2>Dashboard Overview</h2>
                    <p>Your recycling activity at a glance.</p>
                </section>
                <section className="hero recycler-hero" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <small className="recycler-eyebrow">ScrapWala • RECYCLER DASHBOARD</small>
                    <h2>
                        {t("welcome")}, {user.name}
                    </h2>

                    <p>
                        {t("recyclerDescription") === "recyclerDescription"
                            ? "Explore recyclable materials, place purchase requests, and track your environmental impact."
                            : t("recyclerDescription")}
                    </p>
                </section>

                <div className="cards recycler-stat-grid" style={{ display: activeSection === "dashboard" ? "grid" : "none" }}>
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

                <section className="panel recycler-quick-actions" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <div className="recycler-section-title"><div><small>WORKSPACE</small><h3>⚡ Quick Actions</h3></div><span>♻️</span></div>
                    <p>Jump straight to your most-used recycling tools.</p>
                    <div className="recycler-quick-grid">
                        {[
                            ["scrap-lots", "📦", "Browse Scrap Lots", "Find available materials"],
                            ["auctions", "🔨", "Live Auctions", "Bid on bulk materials"],
                            ["marketplace", "🛒", "Marketplace", "Explore listings"],
                            ["purchase-requests", "📥", "Purchase Requests", "Track your requests"],
                            ["certificates", "🏆", "Certificates", "View recycling records"],
                            ["analytics", "📊", "Analytics", "Review your impact"]
                        ].map(([key, icon, title, subtitle]) => (
                            <button key={key} type="button" className="recycler-quick-card" onClick={() => setActiveSection(key)}>
                                <span>{icon}</span><strong>{title}</strong><small>{subtitle}</small>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Environmental Impact */}

                <section className="panel impact-panel recycler-impact" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
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
                                        💵{" "}
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
            <nav className="recycler-mobile-bottom-nav" aria-label="Recycler navigation">
                {[
                    ["dashboard", "🏠", "Home"],
                    ["scrap-lots", "📦", "Lots"],
                    ["auctions", "🔨", "Auctions"],
                    ["purchase-requests", "📥", "Requests"],
                    ["menu", "☰", "More"]
                ].map(([key, icon, label]) => (
                    <button key={key} type="button" className={activeSection === key ? "active" : ""} onClick={() => { if (key === "menu") { setSidebarOpen(true); } else { setActiveSection(key); setSidebarOpen(false); } }}>
                        <span>{icon}</span><small>{label}</small>
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default RecyclerDashboard;