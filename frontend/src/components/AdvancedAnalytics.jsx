import React, { useEffect, useState } from "react";
import { api } from "../api.js";

function AdvancedAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await api("/dashboard/analytics");

                setAnalytics(data);
            } catch (err) {
                console.error("Analytics error:", err);
                setError(
                    err.message || "Failed to load analytics"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <section className="panel analytics-panel">
                <div className="analytics-loading">
                    <div className="analytics-loading-icon">
                        📊
                    </div>

                    <div>
                        <h3>Advanced Analytics</h3>
                        <p>
                            Loading your recycling insights...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="panel analytics-panel">
                <div className="analytics-error">
                    <div className="analytics-error-icon">
                        ⚠️
                    </div>

                    <div>
                        <h3>Unable to load analytics</h3>
                        <p>
                            Failed to load analytics: {error}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!analytics) {
        return null;
    }

    const overview = analytics.overview || {};
    const materials =
        analytics.materialBreakdown || [];
    const monthly =
        analytics.monthlyActivity || [];

    const maxMaterialWeight = Math.max(
        ...materials.map(
            (item) => item.weight || 0
        ),
        1
    );

    return (
        <section className="panel analytics-panel">

            {/* ================= HEADER ================= */}

            <div className="analytics-header">

                <div className="analytics-heading">

                    <div className="analytics-icon">
                        📊
                    </div>

                    <div>
                        <span className="analytics-eyebrow">
                            ECO SCRAP INSIGHTS
                        </span>

                        <h3>
                            Advanced Analytics
                        </h3>

                        <p>
                            Track recycling activity,
                            transactions and environmental
                            impact.
                        </p>
                    </div>

                </div>

                <div className="analytics-header-badge">
                    🌱 Live Data
                </div>

            </div>

            {/* ================= OVERVIEW ================= */}

            <div className="analytics-overview">

                <div className="analytics-stat-card primary">
                    <div className="analytics-stat-icon">
                        ⚖️
                    </div>

                    <div>
                        <span>
                            Total Recycled
                        </span>

                        <strong>
                            {overview.totalWeight || 0}
                            <small> kg</small>
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon money">
                        ₹
                    </div>

                    <div>
                        <span>
                            Transaction Value
                        </span>

                        <strong>
                            ₹{overview.totalAmount || 0}
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon blue">
                        🔄
                    </div>

                    <div>
                        <span>
                            Transactions
                        </span>

                        <strong>
                            {overview.totalTransactions || 0}
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon orange">
                        🚚
                    </div>

                    <div>
                        <span>
                            Completed Pickups
                        </span>

                        <strong>
                            {overview.completedPickups || 0}
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon purple">
                        🏆
                    </div>

                    <div>
                        <span>
                            Certificates
                        </span>

                        <strong>
                            {overview.certificates || 0}
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-icon green">
                        🌱
                    </div>

                    <div>
                        <span>
                            Green Credits
                        </span>

                        <strong>
                            {overview.greenCredits || 0}
                        </strong>
                    </div>
                </div>

                <div className="analytics-stat-card co2-card">
                    <div className="analytics-stat-icon">
                        🌍
                    </div>

                    <div>
                        <span>
                            Estimated CO₂ Impact
                        </span>

                        <strong>
                            {overview.estimatedCO2Saved || 0}
                            <small> kg</small>
                        </strong>
                    </div>
                </div>

            </div>

            {/* ================= MATERIAL + MONTHLY ================= */}

            <div className="analytics-two-column">

                {/* MATERIAL BREAKDOWN */}

                <div className="analytics-section">

                    <div className="analytics-section-heading">
                        <div>
                            <h3>
                                ♻️ Material Breakdown
                            </h3>

                            <p>
                                Recycling volume by
                                material type
                            </p>
                        </div>

                        <span className="analytics-section-icon">
                            ♻️
                        </span>
                    </div>

                    {materials.length === 0 ? (
                        <div className="analytics-empty">
                            <div>📦</div>

                            <p>
                                No material transaction
                                data yet.
                            </p>
                        </div>
                    ) : (
                        <div className="material-list">

                            {materials.map(
                                (item, index) => {
                                    const percentage =
                                        ((item.weight || 0) /
                                            maxMaterialWeight) *
                                        100;

                                    return (
                                        <div
                                            className="material-row"
                                            key={
                                                item._id ||
                                                index
                                            }
                                        >

                                            <div className="material-row-top">

                                                <div className="material-name">
                                                    <span className="material-dot">
                                                        ♻
                                                    </span>

                                                    <strong>
                                                        {item._id ||
                                                            "Unknown Material"}
                                                    </strong>
                                                </div>

                                                <strong>
                                                    {item.weight ||
                                                        0}{" "}
                                                    kg
                                                </strong>

                                            </div>

                                            <div className="material-progress">
                                                <div
                                                    className="material-progress-fill"
                                                    style={{
                                                        width: `${percentage}%`
                                                    }}
                                                />
                                            </div>

                                            <div className="material-meta">
                                                <span>
                                                    {item.transactions ||
                                                        0}{" "}
                                                    transaction(s)
                                                </span>

                                                <span>
                                                    ₹
                                                    {item.amount ||
                                                        0}
                                                </span>
                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>

                {/* MONTHLY ACTIVITY */}

                <div className="analytics-section">

                    <div className="analytics-section-heading">
                        <div>
                            <h3>
                                📅 Monthly Activity
                            </h3>

                            <p>
                                Your recycling activity
                                over time
                            </p>
                        </div>

                        <span className="analytics-section-icon">
                            📈
                        </span>
                    </div>

                    {monthly.length === 0 ? (
                        <div className="analytics-empty">
                            <div>📅</div>

                            <p>
                                No monthly transaction
                                data yet.
                            </p>
                        </div>
                    ) : (
                        <div className="monthly-list">

                            {monthly.map((item) => {
                                const monthName =
                                    new Date(
                                        item._id.year,
                                        item._id.month - 1
                                    ).toLocaleString(
                                        "en",
                                        {
                                            month: "short"
                                        }
                                    );

                                return (
                                    <div
                                        className="monthly-row"
                                        key={`${item._id.year}-${item._id.month}`}
                                    >

                                        <div className="monthly-date">
                                            <strong>
                                                {monthName}
                                            </strong>

                                            <small>
                                                {item._id.year}
                                            </small>
                                        </div>

                                        <div className="monthly-metric">
                                            <span>
                                                ⚖️
                                            </span>

                                            <div>
                                                <small>
                                                    Weight
                                                </small>

                                                <strong>
                                                    {item.weight ||
                                                        0}{" "}
                                                    kg
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="monthly-metric">
                                            <span>
                                                ₹
                                            </span>

                                            <div>
                                                <small>
                                                    Value
                                                </small>

                                                <strong>
                                                    ₹
                                                    {item.amount ||
                                                        0}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="monthly-metric">
                                            <span>
                                                🔄
                                            </span>

                                            <div>
                                                <small>
                                                    Transactions
                                                </small>

                                                <strong>
                                                    {item.transactions ||
                                                        0}
                                                </strong>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </div>

            </div>

            {/* ================= ENVIRONMENT ================= */}

            <div className="analytics-environment">

                <div className="environment-header">

                    <div>
                        <span className="analytics-eyebrow">
                            ENVIRONMENTAL IMPACT
                        </span>

                        <h3>
                            🌱 Your Recycling Impact
                        </h3>

                        <p>
                            Every kilogram processed
                            contributes to a cleaner
                            environment.
                        </p>
                    </div>

                    <div className="environment-icon">
                        🌍
                    </div>

                </div>

                <div className="environment-metrics">

                    <div className="environment-metric">
                        <span>♻️</span>

                        <div>
                            <strong>
                                {overview.totalWeight ||
                                    0}{" "}
                                kg
                            </strong>

                            <small>
                                Material processed
                            </small>
                        </div>
                    </div>

                    <div className="environment-metric">
                        <span>🌱</span>

                        <div>
                            <strong>
                                {overview.greenCredits ||
                                    0}
                            </strong>

                            <small>
                                Green Credits earned
                            </small>
                        </div>
                    </div>

                    <div className="environment-metric">
                        <span>🌍</span>

                        <div>
                            <strong>
                                {overview.estimatedCO2Saved ||
                                    0}{" "}
                                kg
                            </strong>

                            <small>
                                Estimated CO₂ impact
                            </small>
                        </div>
                    </div>

                </div>

                <div className="analytics-disclaimer">
                    <span>ℹ️</span>

                    <p>
                        CO₂ impact is an estimated
                        project metric, not a certified
                        carbon measurement.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default AdvancedAnalytics;