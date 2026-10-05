import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLanguage } from "../i18n.jsx";
import RecyclerMarketplace from "../components/RecyclerMarketplace.jsx";
import PurchaseRequests from "../components/PurchaseRequests.jsx";
import MyPurchaseRequests from "../components/MyPurchaseRequests.jsx";
import WasteTraceability from "../components/WasteTraceability.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import Notifications from "../components/Notifications.jsx";
import TransactionHistory from "../components/TransactionHistory.jsx";
import CreateScrapLot from "../components/CreateScrapLot.jsx";
import CreateAuction from "../components/CreateAuction.jsx";
import MyAuctions from "../components/MyAuction.jsx";
import RecyclingCertificates from "../components/RecyclingCertificates.jsx";
import AdvancedAnalytics from "../components/AdvancedAnalytics.jsx";
import SmartRoute from "../components/SmartRoute.jsx";

function CollectorDashboard({ user, onLogout }) {
    const { t } = useLanguage();

    const [activeSection, setActiveSection] = useState("dashboard");

    const [summary, setSummary] = useState(null);
    const [scrap, setScrap] = useState([]);

    const [selectedScrap, setSelectedScrap] = useState("");
    const [weight, setWeight] = useState("");

    const [pickupItems, setPickupItems] = useState([]);
    const [address, setAddress] = useState("");
    const [slot, setSlot] = useState("");
    const [bookingMessage, setBookingMessage] = useState("");
    const [myPickups, setMyPickups] = useState([]);
    const [availablePickups, setAvailablePickups] = useState([]);

    const [scrapLots, setScrapLots] = useState([]);
    const [scrapLotMessage, setScrapLotMessage] = useState("");

    const [statusMessage, setStatusMessage] = useState("");
    const [actualWeight, setActualWeight] = useState("");
    const [segregationWeights, setSegregationWeights] = useState({});

    const [smartRoute, setSmartRoute] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState("");

    useEffect(() => {
        api("/dashboard/summary")
            .then(setSummary)
            .catch(console.error);

        api("/scrap")
            .then(setScrap)
            .catch(console.error);

        api("/pickups/mine")
            .then(setMyPickups)
            .catch(console.error);

        if (user.role === "COLLECTOR") {
            api("/pickups/available")
                .then(setAvailablePickups)
                .catch(console.error);

            api("/scrap-lots/mine")
                .then((data) => {
                    console.log("MY SCRAP LOTS:", data);
                    setScrapLots(data.lots || []);
                })
                .catch((error) => {
                    console.error(
                        "Get my scrap lots error:",
                        error
                    );
                });
        }
    }, [user.role]);

    const selectedMaterial = scrap.find(
        (item) => item._id === selectedScrap
    );

    const estimatedPrice =
        selectedMaterial && weight
            ? Number(weight) * selectedMaterial.rate
            : 0;

    const bookPickup = async () => {
        if (!pickupItems.length) {
            alert(t("addAtLeastOneScrapItem"));
            return;
        }

        if (!address.trim()) {
            alert(t("enterPickupAddress"));
            return;
        }

        if (!slot) {
            alert(t("selectPickupSlot"));
            return;
        }

        try {
            let latitude = null;
            let longitude = null;

            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise(
                        (resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                                resolve,
                                reject,
                                {
                                    enableHighAccuracy: true,
                                    timeout: 8000,
                                    maximumAge: 60000
                                }
                            );
                        }
                    );

                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                } catch (locationError) {
                    console.warn(
                        "Location unavailable:",
                        locationError.message
                    );
                }
            }

            const data = await api("/pickups", {
                method: "POST",
                body: JSON.stringify({
                    items: pickupItems,
                    address,
                    slot,
                    latitude,
                    longitude
                })
            });

            setBookingMessage(
                `${t("pickupBookedSuccessfully")} ₹${data.estimatedAmount}`
            );

            setPickupItems([]);
            setAddress("");
            setSlot("");

            api("/pickups/mine")
                .then(setMyPickups)
                .catch(console.error);
        } catch (error) {
            alert(error.message);
        }
    };

    const addPickupItem = () => {
        if (
            !selectedScrap ||
            !weight ||
            Number(weight) <= 0
        ) {
            alert(t("selectScrapValidWeight"));
            return;
        }

        const existing = pickupItems.find(
            (item) => item.scrap === selectedScrap
        );

        if (existing) {
            setPickupItems(
                pickupItems.map((item) =>
                    item.scrap === selectedScrap
                        ? {
                              ...item,
                              estimatedWeight:
                                  Number(
                                      item.estimatedWeight
                                  ) +
                                  Number(weight)
                          }
                        : item
                )
            );
        } else {
            setPickupItems([
                ...pickupItems,
                {
                    scrap: selectedScrap,
                    estimatedWeight: Number(weight)
                }
            ]);
        }

        setSelectedScrap("");
        setWeight("");
    };

    const acceptPickup = async (pickupId) => {
        try {
            await api(`/pickups/${pickupId}/accept`, {
                method: "PATCH"
            });

            setAvailablePickups(
                availablePickups.filter(
                    (pickup) => pickup._id !== pickupId
                )
            );

            const updatedPickups = await api(
                "/pickups/mine"
            );

            setMyPickups(updatedPickups);

            window.dispatchEvent(
                new Event("ecoscrap:route-refresh")
            );

            setTimeout(() => {
                document
                    .getElementById("smart-route-panel")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            }, 100);

            alert(
                t("pickupAcceptedSmartRouteUpdated")
            );
        } catch (error) {
            alert(error.message);
        }
    };

    const updatePickupStatus = async (
        pickupId,
        status
    ) => {
        try {
            await api(`/pickups/${pickupId}/status`, {
                method: "PATCH",
                body: JSON.stringify({
                    status
                })
            });

            const updatedPickups = await api(
                "/pickups/mine"
            );

            setMyPickups(updatedPickups);

            if (status === "ARRIVED") {
                setSegregationWeights({});
                setActualWeight("");
            }

            window.dispatchEvent(
                new Event("ecoscrap:route-refresh")
            );

            setStatusMessage(
                `${t("pickupStatusUpdatedTo")} ${status}`
            );
        } catch (error) {
            alert(error.message);
        }
    };

    const completePickup = async (pickupId) => {
        const totalCategoryWeight = Object.values(
            segregationWeights
        ).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );

        if (totalCategoryWeight <= 0) {
            alert("Enter the actual weight for at least one waste category.");
            return;
        }

        const pickup = myPickups.find(
            (item) => item._id === pickupId
        );

        const segregation = (pickup?.items || [])
            .map((item) => ({
                scrap: item.scrap?._id || item.scrap,
                name: item.scrap?.name || "Scrap",
                weight: Number(
                    segregationWeights[
                        item.scrap?._id || item.scrap
                    ] || 0
                )
            }))
            .filter((item) => item.weight > 0);

        try {
            await api(`/pickups/${pickupId}/complete`, {
                method: "PATCH",
                body: JSON.stringify({
                    actualWeight: totalCategoryWeight,
                    segregation
                })
            });

            const updatedPickups = await api(
                "/pickups/mine"
            );

            setMyPickups(updatedPickups);

            window.dispatchEvent(
                new Event("ecoscrap:route-refresh")
            );

            setActualWeight("");
            setSegregationWeights({});
            setStatusMessage(
                t("pickupCompletedSuccessfully")
            );
        } catch (error) {
            alert(error.message);
        }
    };

    const openReceipt = (pickup) => {
        const receiptWindow = window.open(
            "",
            "_blank",
            "width=500,height=700"
        );

        if (!receiptWindow) {
            alert(t("allowPopups"));
            return;
        }

        receiptWindow.document.write(`
            <html>
            <head>
                <title>
                    ${t("digitalReceipt")} -
                    ${pickup.receiptNo}
                </title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        background: #f5f7f6;
                    }

                    .receipt {
                        background: white;
                        max-width: 420px;
                        margin: auto;
                        padding: 30px;
                        border-radius: 16px;
                        box-shadow: 0 5px 25px #0002;
                    }

                    h1 {
                        color: #176b43;
                        text-align: center;
                    }

                    hr {
                        border: 0;
                        border-top: 1px solid #ddd;
                        margin: 20px 0;
                    }

                    p {
                        font-size: 16px;
                        margin: 15px 0;
                    }

                    .amount {
                        font-size: 24px;
                        font-weight: bold;
                        color: #176b43;
                    }

                    .thanks {
                        text-align: center;
                        margin-top: 25px;
                        font-weight: bold;
                    }
                </style>
            </head>

            <body>
                <div class="receipt">
                    <h1>♻️ EcoScrap</h1>

                    <h2>
                        🧾 ${t("digitalReceipt")}
                    </h2>

                    <hr>

                    <p>
                        <strong>${t("receiptNo")}:</strong>
                        ${pickup.receiptNo || "N/A"}
                    </p>

                    <p>
                        <strong>${t("actualWeight")}:</strong>
                        ${pickup.actualWeight || 0} kg
                    </p>

                    <p>
                        <strong>${t("finalAmount")}:</strong>
                    </p>

                    <p class="amount">
                        ₹${pickup.finalAmount || 0}
                    </p>

                    <p>
                        <strong>${t("status")}:</strong>
                        ✅ COMPLETED
                    </p>

                    <p>
                        <strong>${t("greenCredits")}:</strong>
                        ${Math.floor(
                            (pickup.actualWeight || 0) * 10
                        )}
                    </p>

                    <hr>

                    <p class="thanks">
                        ♻️ ${t("thankYouRecycling")}
                    </p>
                </div>
            </body>
            </html>
        `);

        receiptWindow.document.close();
    };

    const manageRecyclerRequest = async (
        lotId,
        action
    ) => {
        try {
            await api(`/scrap-lots/${lotId}/request`, {
                method: "PATCH",
                body: JSON.stringify({ action })
            });

            setScrapLotMessage(
                action === "ACCEPT"
                    ? `✅ ${t("recyclerRequestAccepted")}`
                    : `❌ ${t("recyclerRequestRejected")}`
            );

            setScrapLots((currentLots) =>
                currentLots.filter(
                    (lot) => lot._id !== lotId
                )
            );
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="collector-dashboard">

            {/* TOPBAR */}
            <header className="collector-topbar">
                <div className="collector-brand">
                    <div className="collector-brand-icon">
                        ♻️
                    </div>

                    <div>
                        <b>EcoScrap</b>

                        <span className="collector-role">
                            {user.role}
                        </span>
                    </div>
                </div>

                <button
                    className="collector-logout"
                    onClick={onLogout}
                >
                    {t("logout")}
                </button>
            </header>

            <main className="collector-main">
                <div
                    className="collector-dashboard-layout"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "240px minmax(0, 1fr)",
                        gap: "24px",
                        alignItems: "start"
                    }}
                >
                    <aside
                        className="collector-sidebar"
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
                            <small style={{ color: "#6b7c74", fontWeight: 700 }}>COLLECTOR PANEL</small>
                            <h3 style={{ margin: "6px 0 0" }}>♻️ EcoScrap</h3>
                        </div>

                        <nav style={{ display: "grid", gap: "7px" }}>
                            {[
                                ["dashboard", "🏠", "Dashboard"],
                                ["notifications", "🔔", "Notifications"],
                                ["pickup-requests", "📥", "Pickup Requests"],
                                ["my-pickups", "🚚", "My Pickups"],
                                ["scrap-lots", "📦", "Scrap Lots"],
                                ["smart-route", "🗺️", "Smart Route"],
                                ["marketplace", "🛒", "Marketplace"],
                                ["traceability", "🔗", "Traceability"],
                                ["transactions", "💳", "Transactions"],
                                ["analytics", "📊", "Analytics"],
                                ["pricing", "♻️", "Pricing & Booking"]
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
                                        color: activeSection === key ? "#fff" : "#29443a",
                                        transition: "0.2s"
                                    }}
                                >
                                    <span style={{ marginRight: "9px" }}>{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </nav>

                        <div
                            style={{
                                marginTop: "18px",
                                paddingTop: "15px",
                                borderTop: "1px solid #e8efeb"
                            }}
                        >
                            <small style={{ color: "#718079" }}>Signed in as</small>
                            <strong style={{ display: "block", marginTop: "4px" }}>{user.name}</strong>
                        </div>
                    </aside>

                    <div className="collector-dashboard-content">

                {/* HERO */}
                <section className="collector-hero" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <div>
                        <span className="collector-eyebrow">
                            ECOSCRAP DASHBOARD
                        </span>

                        <h1>
                            {t("welcome")},{" "}
                            {user.name}
                        </h1>

                        <p>
                            {t("dashboardDescription")}
                        </p>
                    </div>

                    <div className="collector-hero-badge">
                        <span>●</span>
                        {user.role}
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="collector-stat-grid" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>

                    <div className="collector-stat-card">
                        <div className="collector-stat-icon">
                            🚚
                        </div>

                        <div>
                            <small>{t("pickups")}</small>
                            <strong>
                                {summary?.pickups || 0}
                            </strong>
                        </div>
                    </div>

                    <div className="collector-stat-card">
                        <div className="collector-stat-icon">
                            ✓
                        </div>

                        <div>
                            <small>{t("completed")}</small>
                            <strong>
                                {summary?.completed || 0}
                            </strong>
                        </div>
                    </div>

                    <div className="collector-stat-card">
                        <div className="collector-stat-icon">
                            ♻️
                        </div>

                        <div>
                            <small>{t("recycledKg")}</small>
                            <strong>
                                {summary?.kg || 0}
                            </strong>
                        </div>
                    </div>

                    <div className="collector-stat-card">
                        <div className="collector-stat-icon">
                            ₹
                        </div>

                        <div>
                            <small>{t("amount")}</small>
                            <strong>
                                ₹{summary?.amount || 0}
                            </strong>
                        </div>
                    </div>

                    <div className="collector-stat-card green-credit-stat">
                        <div className="collector-stat-icon">
                            🌱
                        </div>

                        <div>
                            <small>
                                {t("greenCredits")}
                            </small>
                            <strong>
                                {Math.floor(
                                    (summary?.kg || 0) *
                                        10
                                )}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* ENVIRONMENTAL IMPACT */}
                <section className="collector-impact-section" style={{ display: activeSection === "dashboard" ? "block" : "none" }}>
                    <div className="collector-section-heading">
                        <div>
                            <span>
                                ENVIRONMENT
                            </span>

                            <h3>
                                🌍{" "}
                                {t(
                                    "environmentalImpact"
                                )}
                            </h3>
                        </div>
                    </div>

                    <div className="collector-impact-grid">

                        <div className="collector-impact-card">
                            <span>♻️</span>

                            <strong>
                                {summary?.kg || 0} kg
                            </strong>

                            <small>
                                {t("wasteRecycled")}
                            </small>
                        </div>

                        <div className="collector-impact-card">
                            <span>🌱</span>

                            <strong>
                                {summary?.greenCredits ||
                                    0}
                            </strong>

                            <small>
                                {t("greenCredits")}
                            </small>
                        </div>

                        <div className="collector-impact-card">
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

                        <div className="collector-impact-card">
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

                    <p className="collector-impact-message">
                        🌎{" "}
                        {t(
                            "environmentalMessage"
                        )}
                    </p>
                </section>

                {/* ADVANCED COMPONENTS */}
                <div className="collector-feature-stack">
                    <div style={{ display: activeSection === "notifications" ? "block" : "none" }}>
                        <Notifications />
                    </div>

                    <div style={{ display: activeSection === "marketplace" ? "block" : "none" }}>
                        <CreateAuction />
                    </div>

                    <div style={{ display: activeSection === "marketplace" ? "block" : "none" }}>
                        <MyAuctions />
                    </div>

                    <div style={{ display: activeSection === "marketplace" ? "block" : "none" }}>
                        <RecyclerMarketplace />
                    </div>

                    <div style={{ display: activeSection === "marketplace" ? "block" : "none" }}>
                        <PurchaseRequests />
                    </div>

                    <div style={{ display: activeSection === "marketplace" ? "block" : "none" }}>
                        <MyPurchaseRequests />
                    </div>

                    <div style={{ display: activeSection === "traceability" ? "block" : "none" }}>
                        <WasteTraceability />
                    </div>

                    <div style={{ display: activeSection === "transactions" ? "block" : "none" }}>
                        <TransactionHistory />
                    </div>

                    <div style={{ display: activeSection === "analytics" ? "block" : "none" }}>
                        <RecyclingCertificates />
                    </div>

                    <div style={{ display: activeSection === "analytics" ? "block" : "none" }}>
                        <AdvancedAnalytics />
                    </div>
                </div>

                {/* BOOK PICKUP */}
                <section className="collector-panel" style={{ display: activeSection === "pricing" ? "block" : "none" }}>

                    <div className="collector-panel-header">
                        <div>
                            <span>
                                COLLECTION SERVICE
                            </span>

                            <h3>
                                🚚{" "}
                                {t(
                                    "bookScrapPickup"
                                )}
                            </h3>

                            <p>
                                Schedule a pickup for
                                your recyclable
                                materials.
                            </p>
                        </div>
                    </div>

                    <div className="collector-calculator">

                        <div className="collector-field">
                            <label>
                                {t(
                                    "pickupAddress"
                                )}
                            </label>

                            <textarea
                                rows="3"
                                placeholder={t(
                                    "enterCompletePickupAddress"
                                )}
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="collector-field">
                            <label>
                                {t(
                                    "pickupTimeSlot"
                                )}
                            </label>

                            <select
                                value={slot}
                                onChange={(e) =>
                                    setSlot(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    {t(
                                        "selectTimeSlot"
                                    )}
                                </option>

                                <option value="09:00 AM - 11:00 AM">
                                    09:00 AM - 11:00 AM
                                </option>

                                <option value="11:00 AM - 01:00 PM">
                                    11:00 AM - 01:00 PM
                                </option>

                                <option value="02:00 PM - 04:00 PM">
                                    02:00 PM - 04:00 PM
                                </option>

                                <option value="04:00 PM - 06:00 PM">
                                    04:00 PM - 06:00 PM
                                </option>
                            </select>
                        </div>

                        <button
                            className="collector-primary-button"
                            onClick={addPickupItem}
                        >
                            +{" "}
                            {t(
                                "addScrapItemButton"
                            )}
                        </button>

                        {pickupItems.length > 0 && (
                            <div className="collector-calculation">
                                <div className="collector-calculation-header">
                                    <span>📦</span>
                                    <h3>
                                        {t(
                                            "pickupItems"
                                        )}
                                    </h3>
                                </div>

                                {pickupItems.map(
                                    (item, index) => {
                                        const scrapItem =
                                            scrap.find(
                                                (s) =>
                                                    s._id ===
                                                    item.scrap
                                            );

                                        return (
                                            <div
                                                className="collector-pickup-item"
                                                key={index}
                                            >
                                                <span>
                                                    {scrapItem?.name ||
                                                        "Scrap"}
                                                </span>

                                                <strong>
                                                    {
                                                        item.estimatedWeight
                                                    }{" "}
                                                    kg
                                                </strong>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}

                        <button
                            className="collector-book-button"
                            onClick={bookPickup}
                        >
                            🚚{" "}
                            {t("bookPickup")}
                        </button>

                        {bookingMessage && (
                            <div className="collector-success-message">
                                ✓ {bookingMessage}
                            </div>
                        )}

                    </div>
                </section>

                {/* AVAILABLE PICKUPS */}
                {user.role === "COLLECTOR" && (
                    <section className="collector-panel" style={{ display: activeSection === "pickup-requests" ? "block" : "none" }}>

                        <div className="collector-panel-header">
                            <div>
                                <span>
                                    COLLECTOR WORKSPACE
                                </span>

                                <h3>
                                    👷{" "}
                                    {t(
                                        "availablePickupRequests"
                                    )}
                                </h3>

                                <p>
                                    Pick up available
                                    collection requests
                                    in your area.
                                </p>
                            </div>

                            <span className="collector-section-badge">
                                {availablePickups.length}{" "}
                                Available
                            </span>
                        </div>

                        {availablePickups.length === 0 ? (
                            <div className="collector-empty-state">
                                <div>🚚</div>

                                <h4>
                                    {t(
                                        "noAvailablePickupRequests"
                                    )}
                                </h4>

                                <p>
                                    New pickup requests
                                    will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="collector-pickup-grid">
                                {availablePickups.map(
                                    (pickup) => (
                                        <div
                                            className="collector-pickup-card"
                                            key={
                                                pickup._id
                                            }
                                        >
                                            <div className="collector-pickup-card-header">
                                                <div>
                                                    <span className="collector-pickup-icon">
                                                        🚚
                                                    </span>

                                                    <strong>
                                                        Pickup #
                                                        {pickup._id.slice(
                                                            -6
                                                        )}
                                                    </strong>
                                                </div>

                                                <span className="collector-status requested">
                                                    {t(
                                                        "requested"
                                                    ).toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="collector-pickup-info">
                                                <p>
                                                    📍{" "}
                                                    <strong>
                                                        {t(
                                                            "address"
                                                        )}
                                                        :
                                                    </strong>{" "}
                                                    {
                                                        pickup.address
                                                    }
                                                </p>

                                                <p>
                                                    🕐{" "}
                                                    <strong>
                                                        {t(
                                                            "slot"
                                                        )}
                                                        :
                                                    </strong>{" "}
                                                    {
                                                        pickup.slot
                                                    }
                                                </p>
                                            </div>

                                            <div className="collector-pickup-materials">
                                                {pickup.items.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                        >
                                                            ♻️{" "}
                                                            {item
                                                                .scrap
                                                                ?.name ||
                                                                "Scrap"}
                                                            <strong>
                                                                {
                                                                    item.estimatedWeight
                                                                }{" "}
                                                                kg
                                                            </strong>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <button
                                                className="collector-accept-button"
                                                onClick={() =>
                                                    acceptPickup(
                                                        pickup._id
                                                    )
                                                }
                                            >
                                                ✅{" "}
                                                {t(
                                                    "acceptPickup"
                                                )}
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* SMART ROUTE */}
                <div style={{ display: activeSection === "smart-route" ? "block" : "none" }}>
                    <SmartRoute />
                </div>

                {/* MY PICKUPS */}
                <section className="collector-panel" style={{ display: activeSection === "my-pickups" ? "block" : "none" }}>

                    <div className="collector-panel-header">
                        <div>
                            <span>
                                PICKUP MANAGEMENT
                            </span>

                            <h3>
                                📋{" "}
                                {t(
                                    "myPickupRequests"
                                )}
                            </h3>

                            <p>
                                Track and update your
                                pickup requests.
                            </p>
                        </div>

                        <span className="collector-section-badge">
                            {myPickups.length} Requests
                        </span>
                    </div>

                    {myPickups.length === 0 ? (
                        <div className="collector-empty-state">
                            <div>📋</div>

                            <h4>
                                {t(
                                    "noPickupRequests"
                                )}
                            </h4>

                            <p>
                                Your pickup requests
                                will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="collector-my-pickups">

                            {myPickups.map(
                                (pickup) => (
                                    <div
                                        className="collector-my-pickup-card"
                                        key={
                                            pickup._id
                                        }
                                    >
                                        <div className="collector-my-pickup-header">
                                            <div>
                                                <strong>
                                                    🚚 Pickup #
                                                    {pickup._id.slice(
                                                        -6
                                                    )}
                                                </strong>

                                                <span
                                                    className={`collector-status ${pickup.status.toLowerCase()}`}
                                                >
                                                    {
                                                        pickup.status
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="collector-my-pickup-info">
                                            <p>
                                                📍{" "}
                                                <strong>
                                                    {t(
                                                        "address"
                                                    )}
                                                    :
                                                </strong>{" "}
                                                {
                                                    pickup.address
                                                }
                                            </p>

                                            <p>
                                                🕐{" "}
                                                <strong>
                                                    {t(
                                                        "slot"
                                                    )}
                                                    :
                                                </strong>{" "}
                                                {
                                                    pickup.slot
                                                }
                                            </p>
                                        </div>

                                        <div className="collector-my-pickup-items">
                                            {pickup.items.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        <span>
                                                            ♻️{" "}
                                                            {item
                                                                .scrap
                                                                ?.name ||
                                                                "Scrap"}
                                                        </span>

                                                        <strong>
                                                            {
                                                                item.estimatedWeight
                                                            }{" "}
                                                            kg
                                                        </strong>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {pickup.actualWeight >
                                            0 && (
                                            <div className="collector-result-row">
                                                <span>
                                                    ⚖️{" "}
                                                    {
                                                        t(
                                                            "actualWeight"
                                                        )
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        pickup.actualWeight
                                                    }{" "}
                                                    kg
                                                </strong>
                                            </div>
                                        )}

                                        {pickup.finalAmount >
                                            0 && (
                                            <div className="collector-result-row amount-row">
                                                <span>
                                                    💰{" "}
                                                    {
                                                        t(
                                                            "finalAmount"
                                                        )
                                                    }
                                                </span>

                                                <strong>
                                                    ₹
                                                    {
                                                        pickup.finalAmount
                                                    }
                                                </strong>
                                            </div>
                                        )}

                                        {/* STATUS ACTIONS */}
                                        {user.role ===
                                            "COLLECTOR" &&
                                            pickup.status ===
                                                "ACCEPTED" && (
                                                <button
                                                    className="collector-action-button"
                                                    onClick={() =>
                                                        updatePickupStatus(
                                                            pickup._id,
                                                            "ON_WAY"
                                                        )
                                                    }
                                                >
                                                    🚚{" "}
                                                    {t(
                                                        "onTheWay"
                                                    )}
                                                </button>
                                            )}

                                        {user.role ===
                                            "COLLECTOR" &&
                                            pickup.status ===
                                                "ON_WAY" && (
                                                <button
                                                    className="collector-action-button"
                                                    onClick={() =>
                                                        updatePickupStatus(
                                                            pickup._id,
                                                            "ARRIVED"
                                                        )
                                                    }
                                                >
                                                    📍{" "}
                                                    {t(
                                                        "arrived"
                                                    )}
                                                </button>
                                            )}

                                        {user.role ===
                                            "COLLECTOR" &&
                                            pickup.status ===
                                                "ARRIVED" && (
                                                <div className="collector-complete-box">
                                                    <h4>♻️ Collect & Categorize Waste</h4>
                                                    <p>Enter the actual weight collected for each category.</p>

                                                    {(pickup.items || []).map((item, index) => {
                                                        const scrapId =
                                                            item.scrap?._id || item.scrap;

                                                        return (
                                                            <div
                                                                key={scrapId || index}
                                                                className="collector-result-row"
                                                            >
                                                                <span>
                                                                    ♻️ {item.scrap?.name || "Scrap"}
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    placeholder="Actual kg"
                                                                    value={
                                                                        segregationWeights[scrapId] || ""
                                                                    }
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setSegregationWeights((current) => ({
                                                                            ...current,
                                                                            [scrapId]: value
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    })}

                                                    <div className="collector-result-row amount-row">
                                                        <span>⚖️ <strong>Actual Total Weight</strong></span>
                                                        <strong>
                                                            {Object.values(segregationWeights)
                                                                .reduce((sum, value) => sum + Number(value || 0), 0)
                                                                .toFixed(1)} kg
                                                        </strong>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            completePickup(
                                                                pickup._id
                                                            )
                                                        }
                                                    >
                                                        ✅ {t("completePickup")}
                                                    </button>
                                                </div>
                                            )}

                                        {pickup.status ===
                                            "COMPLETED" && (
                                            <div className="collector-digital-receipt">
                                                <div className="collector-receipt-heading">
                                                    <span>
                                                        🧾
                                                    </span>

                                                    <div>
                                                        <small>
                                                            COMPLETED
                                                        </small>

                                                        <h4>
                                                            {t(
                                                                "digitalReceipt"
                                                            )}
                                                        </h4>
                                                    </div>
                                                </div>

                                                <p>
                                                    <strong>
                                                        {
                                                            t(
                                                                "receiptNo"
                                                            )
                                                        }
                                                        :
                                                    </strong>{" "}
                                                    {pickup.receiptNo ||
                                                        "N/A"}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Final
                                                        Amount:
                                                    </strong>{" "}
                                                    ₹
                                                    {
                                                        pickup.finalAmount
                                                    }
                                                </p>

                                                <button
                                                    type="button"
                                                    className="receipt-button"
                                                    onClick={() =>
                                                        openReceipt(
                                                            pickup
                                                        )
                                                    }
                                                >
                                                    🧾{" "}
                                                    {t(
                                                        "viewFullReceipt"
                                                    )}
                                                </button>

                                                {user.role ===
                                                    "USER" && (
                                                    <ReviewForm
                                                        pickupId={
                                                            pickup._id
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {statusMessage && (
                                            <div className="collector-success-message">
                                                ✓{" "}
                                                {
                                                    statusMessage
                                                }
                                            </div>
                                        )}
                                    </div>
                                )
                            )}

                        </div>
                    )}
                </section>

                {/* SCRAP PRICE LIST */}
                <section className="collector-panel" style={{ display: activeSection === "pricing" ? "block" : "none" }}>

                    <div className="collector-panel-header">
                        <div>
                            <span>
                                CURRENT PRICING
                            </span>

                            <h3>
                                ♻️{" "}
                                {t(
                                    "scrapPriceList"
                                )}
                            </h3>
                        </div>
                    </div>

                    <div className="collector-price-grid">
                        {scrap.map((item) => (
                            <div
                                className="collector-price-card"
                                key={item._id}
                            >
                                <div>
                                    <span>
                                        ♻️
                                    </span>

                                    <b>
                                        {item.name}
                                    </b>
                                </div>

                                <strong>
                                    ₹{item.rate}
                                    <small>
                                        /kg
                                    </small>
                                </strong>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PRICE CALCULATOR */}
                <section className="collector-panel" style={{ display: activeSection === "pricing" ? "block" : "none" }}>

                    <div className="collector-panel-header">
                        <div>
                            <span>
                                ESTIMATE VALUE
                            </span>

                            <h3>
                                🧮{" "}
                                {t(
                                    "scrapPriceCalculator"
                                )}
                            </h3>

                            <p>
                                Calculate the estimated
                                value of your scrap.
                            </p>
                        </div>
                    </div>

                    <div className="collector-calculator calculator-modern">

                        <div className="collector-field">
                            <label>
                                {t(
                                    "selectScrap"
                                )}
                            </label>

                            <select
                                value={
                                    selectedScrap
                                }
                                onChange={(e) =>
                                    setSelectedScrap(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    {t(
                                        "selectMaterial"
                                    )}
                                </option>

                                {scrap.map(
                                    (item) => (
                                        <option
                                            key={
                                                item._id
                                            }
                                            value={
                                                item._id
                                            }
                                        >
                                            {item.name} —
                                            ₹
                                            {
                                                item.rate
                                            }
                                            /kg
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="collector-field">
                            <label>
                                {t(
                                    "weightKg"
                                )}
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder={t(
                                    "enterWeight"
                                )}
                                value={weight}
                                onChange={(e) =>
                                    setWeight(
                                        e.target
                                            .value
                                    )
                                }
                            />
                        </div>

                        {selectedMaterial && (
                            <div className="collector-value-calculation">

                                <div>
                                    <span>
                                        {t(
                                            "rate"
                                        )}
                                    </span>

                                    <strong>
                                        ₹
                                        {
                                            selectedMaterial.rate
                                        }
                                        /kg
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        {t(
                                            "weight"
                                        )}
                                    </span>

                                    <strong>
                                        {weight ||
                                            0}{" "}
                                        kg
                                    </strong>
                                </div>

                                <div className="collector-estimated-value">
                                    <span>
                                        {t(
                                            "estimatedValue"
                                        )}
                                    </span>

                                    <strong>
                                        ₹
                                        {estimatedPrice.toFixed(
                                            2
                                        )}
                                    </strong>
                                </div>

                            </div>
                        )}
                    </div>
                </section>

                {/* CREATE SCRAP LOT */}
                <div style={{ display: activeSection === "scrap-lots" ? "block" : "none" }}>
                    <CreateScrapLot />
                </div>

                {/* RECYCLER REQUESTS */}
                <section className="collector-panel" style={{ display: activeSection === "scrap-lots" ? "block" : "none" }}>

                    <div className="collector-panel-header">
                        <div>
                            <span>
                                DIGITAL INVENTORY
                            </span>

                            <h3>
                                📦{" "}
                                {t(
                                    "recyclerRequests"
                                )}
                            </h3>

                            <p>
                                Manage recycler requests
                                for your digital scrap
                                lots.
                            </p>
                        </div>

                        <span className="collector-section-badge">
                            {scrapLots.length} Lots
                        </span>
                    </div>

                    {scrapLots.length === 0 ? (
                        <div className="collector-empty-state">
                            <div>📦</div>

                            <h4>
                                {t(
                                    "noDigitalScrapLots"
                                )}
                            </h4>

                            <p>
                                Your digital scrap lots
                                will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="collector-scrap-lot-grid">

                            {scrapLots.map((lot) => (
                                <div
                                    className="collector-scrap-lot-card"
                                    key={lot._id}
                                >
                                    <div className="collector-lot-header">
                                        <div className="collector-lot-icon">
                                            ♻️
                                        </div>

                                        <div>
                                            <span>
                                                SCRAP LOT
                                            </span>

                                            <h4>
                                                {lot
                                                    .material
                                                    ?.name ||
                                                    "Scrap"}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="collector-lot-details">

                                        <div>
                                            <small>
                                                ⚖️{" "}
                                                {
                                                    t(
                                                        "weight"
                                                    )
                                                }
                                            </small>

                                            <strong>
                                                {
                                                    lot.weight
                                                }{" "}
                                                kg
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                💰{" "}
                                                {
                                                    t(
                                                        "indicativeValue"
                                                    )
                                                }
                                            </small>

                                            <strong>
                                                ₹
                                                {
                                                    lot.indicativePrice
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                📋{" "}
                                                {
                                                    t(
                                                        "requestStatus"
                                                    )
                                                }
                                            </small>

                                            <strong>
                                                {lot.requestStatus ||
                                                    (lot.requestedBy
                                                        ? "PENDING"
                                                        : "NONE")}
                                            </strong>
                                        </div>
                                    </div>

                                    {lot.requestedBy && (
                                        <div className="collector-recycler-requester">
                                            <div>
                                                👤
                                            </div>

                                            <p>
                                                <small>
                                                    {
                                                        t(
                                                            "recycler"
                                                        )
                                                    }
                                                </small>

                                                <strong>
                                                    {
                                                        lot
                                                            .requestedBy
                                                            .name ||
                                                        t(
                                                            "recycler"
                                                        )
                                                    }
                                                </strong>
                                            </p>

                                            {lot
                                                .requestedBy
                                                .verified && (
                                                <span>
                                                    ✓{" "}
                                                    {
                                                        t(
                                                            "verifiedRecycler"
                                                        )
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {lot.requestedBy &&
                                        !lot.requestedBy
                                            .verified && (
                                            <div className="collector-unverified-notice">
                                                ⏳{" "}
                                                {t(
                                                    "recyclerNotVerified"
                                                )}
                                            </div>
                                        )}

                                    {(lot.requestStatus ===
                                        "PENDING" ||
                                        (!lot.requestStatus &&
                                            lot.requestedBy)) && (
                                        <div className="collector-request-actions">

                                            <button
                                                type="button"
                                                className="collector-accept-request"
                                                onClick={() =>
                                                    manageRecyclerRequest(
                                                        lot._id,
                                                        "ACCEPT"
                                                    )
                                                }
                                            >
                                                ✅{" "}
                                                {t(
                                                    "accept"
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="collector-reject-request"
                                                onClick={() =>
                                                    manageRecyclerRequest(
                                                        lot._id,
                                                        "REJECT"
                                                    )
                                                }
                                            >
                                                ❌{" "}
                                                {t(
                                                    "reject"
                                                )}
                                            </button>

                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    )}

                    {scrapLotMessage && (
                        <div className="collector-success-message">
                            ✓ {scrapLotMessage}
                        </div>
                    )}
                </section>

                {/* MAIN FLOW */}
                <section
                    className="collector-flow-section"
                    style={{ display: activeSection === "dashboard" ? "block" : "none" }}
                >

                    <div className="collector-flow-icon">
                        🚀
                    </div>

                    <div>
                        <span>
                            HOW IT WORKS
                        </span>

                        <h3>
                            {t(
                                "ecoscrapFlow"
                            )}
                        </h3>

                        <p>
                            {t(
                                "flowText"
                            )}
                        </p>
                    </div>

                </section>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default CollectorDashboard;