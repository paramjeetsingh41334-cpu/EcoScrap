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

                <button onClick={onLogout}>
                    {t("logout")}
                </button>
            </header>

            <main>
                <section className="hero">
                    <h2>
                        {t("welcome")}, {user.name}
                    </h2>

                    <p>
                        {t("recyclerDescription")}
                    </p>
                </section>

                <div className="cards">
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

                <section className="panel impact-panel">
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

                <Notifications />

                <section className="panel">
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

                <LiveAuctions />

                <WonAuctions />

                <RecyclerMarketplace />

                <PurchaseRequests />

                <MyPurchaseRequests />

                <WasteTraceability />

                <TransactionHistory />

                <RecyclingCertificates />

                <AdvancedAnalytics />

                <section className="panel">
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
            </main>
        </div>
    );
}

export default RecyclerDashboard;