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
import CollectorDashboard from "./CollectorDashboard.jsx";
import MyAuctions from "../components/MyAuction.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";

function UserDashboard({ user, onLogout }) {

    const { t } = useLanguage();

    const [summary, setSummary] = useState(null);
    const [scrap, setScrap] = useState([]);
    const [activePage, setActivePage] = useState("dashboard");

    const [selectedScrap, setSelectedScrap] = useState("");
    const [weight, setWeight] = useState("");

    const [pickupItems, setPickupItems] = useState([]);
    const [address, setAddress] = useState("");
    const [slot, setSlot] = useState("");
    const [bookingMessage, setBookingMessage] = useState("");
    const [locationStatus, setLocationStatus] = useState("");
    const [myPickups, setMyPickups] = useState([]);
    const [availablePickups, setAvailablePickups] = useState([]);

    const [statusMessage, setStatusMessage] = useState("");
    const [actualWeight, setActualWeight] = useState("");

    const [segregationWeights, setSegregationWeights] = useState({
        Paper: "",
        Plastic: "",
        Metal: "",
        "E-waste": "",
        Cardboard: "",
    });

    

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

        // for collector dashboard
        if (user.role === "COLLECTOR") {
        api("/pickups/available")
           .then(setAvailablePickups)
           .catch(console.error);
}

    }, []);

    const selectedMaterial = scrap.find(
        item => item._id === selectedScrap
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
        // 📍 Capture the pickup location for Smart Route Optimization.
        // This works for USER and ORGANIZATION pickup requests.
        let latitude = null;
        let longitude = null;

        if ("geolocation" in navigator) {
            setLocationStatus(`📍 ${t("gettingPickupLocation")}`);

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        resolve,
                        reject,
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 60000
                        }
                    );
                });

                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                setLocationStatus(`✅ ${t("pickupLocationCaptured")}`);
            } catch (locationError) {
                console.warn(
                    "Location unavailable:",
                    locationError.message
                );

                setLocationStatus(`⚠️ ${t("locationPermissionUnavailable")}`);
            }
        } else {
            setLocationStatus(`⚠️ ${t("geolocationNotSupported")}`);
        }

        const data = await api("/pickups", {
            method: "POST",
            body: JSON.stringify({
                items: pickupItems,
                segregation: pickupItems.map(item => ({
                    scrap: item.scrap,
                    name: item.scrap?.name || "Scrap",
                    weight: Number(item.estimatedWeight)
                })),
                address,
                slot,
                latitude,
                longitude
            })
        });

        setBookingMessage(`${t("pickupBookedSuccessfully")} ₹${data.estimatedAmount}`);

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


// for piickup item 
   const addPickupItem = () => {
    if (!selectedScrap || !weight || Number(weight) <= 0) {
        alert(t("selectScrapValidWeight"));
        return;
    }

    const existing = pickupItems.find(
        item => item.scrap === selectedScrap
    );

    if (existing) {
        setPickupItems(
            pickupItems.map(item =>
                item.scrap === selectedScrap
                    ? {
                          ...item,
                          estimatedWeight:
                              Number(item.estimatedWeight) + Number(weight)
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


// accept pickup

const acceptPickup = async (pickupId) => {
    try {
        await api(`/pickups/${pickupId}/accept`, {
            method: "PATCH"
        });

        setAvailablePickups(
            availablePickups.filter(
                pickup => pickup._id !== pickupId
            )
        );

        api("/pickups/mine")
         .then(setMyPickups)
         .catch(console.error);

        alert(t("pickupAcceptedSuccessfully"));
    } catch (error) {
        alert(error.message);
    }
};


//pickup status
const updatePickupStatus = async (pickupId, status) => {
    try {
        await api(`/pickups/${pickupId}/status`, {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        });

        const updatedPickups = await api("/pickups/mine");
        setMyPickups(updatedPickups);

        setStatusMessage(`${t("pickupStatusUpdatedTo")} ${status}`);
    } catch (error) {
        alert(error.message);
    }
};


//for actual weight
const segregationTotal = Object.values(segregationWeights).reduce(
    (total, value) => total + (Number(value) || 0),
    0
);

const updateSegregationWeight = (category, value) => {
    setSegregationWeights((current) => ({
        ...current,
        [category]: value,
    }));
};

const completePickup = async (pickupId) => {
    if (!actualWeight || Number(actualWeight) <= 0) {
        alert(t("enterValidActualWeight"));
        return;
    }

    try {
        await api(`/pickups/${pickupId}/complete`, {
            method: "PATCH",
            body: JSON.stringify({
                actualWeight: Number(actualWeight)
            })
        });

        const updatedPickups = await api("/pickups/mine");
        setMyPickups(updatedPickups);

        setActualWeight("");
        setSegregationWeights({
            Paper: "",
            Plastic: "",
            Metal: "",
            "E-waste": "",
            Cardboard: "",
        });
        setStatusMessage(t("pickupCompletedSuccessfully"));
    } catch (error) {
        alert(error.message);
    }
};


const confirmPayment = async (pickupId) => {
    try {
        await api(`/pickups/${pickupId}/pay`, {
            method: "PATCH"
        });

        const updatedPickups = await api("/pickups/mine");
        setMyPickups(updatedPickups);

        setStatusMessage(t("paymentConfirmedSuccessfully"));
    } catch (error) {
        alert(error.message);
    }
};

{/**for viewing recipt */}


        

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
            <title>Digital Receipt - ${pickup.receiptNo}</title>

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

                <h1>♻️ EcoScarp</h1>

                <h2>🧾 ${t("digitalReceipt")}</h2>

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
                    ${Math.floor((pickup.actualWeight || 0) * 10)}
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




    return (
        <DashboardLayout
            user={user}
            onLogout={onLogout}
            activePage={activePage}
            onNavigate={setActivePage}
        >
            <div className="app">




            <div style={{
    marginBottom: "20px",
    padding: "18px",
    border: "1px solid #dce9e2",
    borderRadius: "14px",
    background: "#f7fbf8"
}}>
    <strong style={{ color: "#176b43", fontSize: "16px" }}>
        ♻️ Core Waste Journey
    </strong>
    <div style={{
        marginTop: "10px",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
        fontSize: "13px"
    }}>
        {[
            "♻️ Segregate",
            "📱 Collect",
            "⚖️ Record",
            "🧾 Receipt",
            "🔗 Trace",
            "🏭 Recycle / Dispose"
        ].map((step, index) => (
            <React.Fragment key={step}>
                <span style={{
                    padding: "7px 10px",
                    borderRadius: "999px",
                    background: "#fff",
                    border: "1px solid #dce9e2",
                    color: "#176b43",
                    fontWeight: 600
                }}>{step}</span>
                {index < 5 && <span style={{ color: "#98a69e" }}>→</span>}
            </React.Fragment>
        ))}
    </div>
</div>

<main>

                {activePage === "dashboard" && (
                    <>
                {/* Welcome */}

                <section className="hero">

                    <h2>
                        {t("welcome")}, {user.name}
                    </h2>

                    <p>
                        Connect households, collectors,
                        organizations and recyclers.
                    </p>

                </section>


                {/* Statistics */}

                <div className="cards">

                    <div className="card">
                        <small>{t("pickups")}</small>
                        <strong>
                            {summary?.pickups || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>{t("completed")}</small>
                        <strong>
                            {summary?.completed || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>{t("recycledKg")}</small>
                        <strong>
                            {summary?.kg || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>{t("amount")}</small>
                        <strong>
                            {summary?.amount || 0}
                        </strong>
                    </div>

                    <div className="card">
                        <small>{t("greenCredits")}</small>
                        <strong>
                            {summary?.greenCredits || 0}
                        </strong>
                    </div>

                </div>
{/* Environmental Impact */}

<section className="panel impact-panel">

    <h3>🌍 {t("environmentalImpact")}</h3>

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
                {summary?.greenCredits || 0}
            </strong>
            <small>
                Green Credits
            </small>
        </div>

        <div className="impact-item">
            <span>🌳</span>
            <strong>
                {((summary?.kg || 0) / 100).toFixed(1)}
            </strong>
            <small>
                {t("treeEquivalent")}
            </small>
        </div>

        <div className="impact-item">
            <span>💧</span>
            <strong>
                {((summary?.kg || 0) * 10).toFixed(0)} L
            </strong>
            <small>
                {t("waterSaving")}
            </small>
        </div>

    </div>

    <p className="impact-message">
        🌎 Every kilogram of waste recycled helps reduce
        landfill waste and supports a circular economy.
    </p>

</section>

                    </>
                )}

                {activePage === "notifications" && <Notifications />}

                {activePage === "marketplace" && (
                    <>
<section className="panel">
    <h3>🛒 Marketplace</h3>
    <p>Explore recyclable materials, requests and marketplace activity.</p>
</section>
<RecyclerMarketplace />
<PurchaseRequests />
<MyPurchaseRequests />


{user.role === "ORGANIZATION" && (
    <CreateAuction organizationMode={true} />
)}

{(user.role === "ORGANIZATION" || user.role === "COLLECTOR") && (
    <MyAuctions />
)}
                    </>
                )}

                {activePage === "traceability" && <WasteTraceability />}

                {activePage === "transactions" && <TransactionHistory />}

                {activePage === "analytics" && (
                    <section className="panel">
                        <h3>📈 Analytics</h3>
                        <p>Track your EcoScrap pickup, recycling and Green Credit activity.</p>
                        <div className="cards">
                            <div className="card">
                                <small>{t("pickups")}</small>
                                <strong>{summary?.pickups || 0}</strong>
                            </div>
                            <div className="card">
                                <small>{t("completed")}</small>
                                <strong>{summary?.completed || 0}</strong>
                            </div>
                            <div className="card">
                                <small>{t("recycledKg")}</small>
                                <strong>{summary?.kg || 0}</strong>
                            </div>
                            <div className="card">
                                <small>{t("greenCredits")}</small>
                                <strong>{summary?.greenCredits || 0}</strong>
                            </div>
                        </div>
                    </section>
                )}

                {activePage === "pickup" && (
                    <>
                        {/* Waste Segregation + Pickup Booking */}
                        <section className="panel">
                            <h3>♻️ Waste Segregation Guide</h3>
                            <p>
                                Separate your waste by category, enter the estimated weight,
                                review the value, and then book your pickup.
                            </p>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                    gap: "12px",
                                    margin: "18px 0"
                                }}
                            >
                                {[
                                    ["📄", "Paper", "Newspapers, paper"],
                                    ["🥤", "Plastic", "Bottles, containers"],
                                    ["🔩", "Metal", "Iron, aluminium, cans"],
                                    ["💻", "E-waste", "Mobiles, electronics"],
                                    ["📦", "Cardboard", "Boxes, packaging"]
                                ].map(([icon, name, description]) => (
                                    <div
                                        key={name}
                                        style={{
                                            border: "1px solid #d9e7df",
                                            borderRadius: "12px",
                                            padding: "14px",
                                            background: "#f7fbf8"
                                        }}
                                    >
                                        <div style={{ fontSize: "24px" }}>{icon}</div>
                                        <strong>{name}</strong>
                                        <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.75 }}>
                                            {description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="panel">
                            <h3>♻️ Select Waste Category & Calculate Value</h3>

                            <div className="calculator">
                                <label>Waste Category</label>
                                <select
                                    value={selectedScrap}
                                    onChange={(e) => setSelectedScrap(e.target.value)}
                                >
                                    <option value="">Select waste category</option>
                                    {scrap.map(item => (
                                        <option key={item._id} value={item._id}>
                                            {item.name} — ₹{item.rate}/kg
                                        </option>
                                    ))}
                                </select>

                                <label>Estimated Weight (kg)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="Enter weight"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />

                                {selectedMaterial && (
                                    <div className="calculation">
                                        <p>
                                            Rate: <strong>₹{selectedMaterial.rate}/kg</strong>
                                        </p>
                                        <p>
                                            Weight: <strong>{weight || 0} kg</strong>
                                        </p>
                                        <p>
                                            Estimated Value: <strong>₹{estimatedPrice.toFixed(2)}</strong>
                                        </p>
                                    </div>
                                )}

                                <button onClick={addPickupItem}>
                                    ➕ Add Waste Category
                                </button>
                            </div>

                            {pickupItems.length > 0 && (
                                <div className="calculation" style={{ marginTop: "18px" }}>
                                    <h3>📋 Segregated Waste</h3>

                                    {pickupItems.map((item, index) => {
                                        const scrapItem = scrap.find(s => s._id === item.scrap);
                                        const itemValue =
                                            Number(item.estimatedWeight || 0) *
                                            Number(scrapItem?.rate || 0);

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: "12px",
                                                    padding: "10px 0",
                                                    borderBottom: "1px solid #e5eee9"
                                                }}
                                            >
                                                <strong>♻️ {scrapItem?.name || "Scrap"}</strong>
                                                <span>{item.estimatedWeight} kg</span>
                                                <strong>₹{itemValue.toFixed(2)}</strong>
                                            </div>
                                        );
                                    })}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: "14px",
                                            fontWeight: 700
                                        }}
                                    >
                                        <span>Total Waste</span>
                                        <span>
                                            {pickupItems
                                                .reduce(
                                                    (sum, item) => sum + Number(item.estimatedWeight || 0),
                                                    0
                                                )
                                                .toFixed(1)} kg
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: "8px",
                                            fontWeight: 700
                                        }}
                                    >
                                        <span>Estimated Value</span>
                                        <span>
                                            ₹
                                            {pickupItems
                                                .reduce((sum, item) => {
                                                    const scrapItem = scrap.find(s => s._id === item.scrap);
                                                    return (
                                                        sum +
                                                        Number(item.estimatedWeight || 0) *
                                                        Number(scrapItem?.rate || 0)
                                                    );
                                                }, 0)
                                                .toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="panel">
                            <h3>🚚 Book Scrap Pickup</h3>

                            <div className="calculator">
                                <label>{t("pickupAddress")}</label>
                                <textarea
                                    rows="3"
                                    placeholder={t("enterCompletePickupAddress")}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />

                                <label>{t("pickupTimeSlot")}</label>
                                <select
                                    value={slot}
                                    onChange={(e) => setSlot(e.target.value)}
                                >
                                    <option value="">{t("selectTimeSlot")}</option>
                                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                                </select>

                                {locationStatus && (
                                    <div
                                        className={
                                            locationStatus.startsWith("⚠️")
                                                ? "error-message"
                                                : "success-message"
                                        }
                                        style={{ marginTop: "10px" }}
                                    >
                                        {locationStatus}
                                    </div>
                                )}

                                <button onClick={bookPickup} disabled={!pickupItems.length}>
                                    🚚 Book Pickup
                                </button>

                                {bookingMessage && (
                                    <div className="success-message">
                                        {bookingMessage}
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}

                {activePage === "my-pickups" && (
                    <>
{/* Collector Dashboard */}

{user.role === "COLLECTOR" && (
    <CollectorDashboard />
)}

{/* My Pickup Requests */}

<section className="panel">

    <h3>📋 {t("myPickupRequests")}</h3>

    {myPickups.length === 0 ? (
        <p>{t("noPickupRequests")}</p>
    ) : (
        <div className="pickup-list">

            {myPickups.map(pickup => (

                <div className="pickup-card" key={pickup._id}>

                    <div className="pickup-header">
                        <strong>
                            🚚 Pickup #{pickup._id.slice(-6)}
                        </strong>

                        <span className={`status ${pickup.status.toLowerCase()}`}>
                            {pickup.status}
                        </span>
                    </div>

                    <p>
                        📍 <strong>{t("address")}:</strong> {pickup.address}
                    </p>

                    <p>
                        🕐 <strong>{t("slot")}:</strong> {pickup.slot}
                    </p>

                    <div className="pickup-items">

                        {pickup.items.map((item, index) => (
                            <p key={index}>
                                ♻️ {item.scrap?.name || "Scrap"}
                                {" — "}
                                {item.estimatedWeight} kg
                            </p>
                        ))}

                    </div>

                    {pickup.actualWeight > 0 && (
                        <p>
                            ⚖️ <strong>${t("actualWeight")}:</strong>{" "}
                            {pickup.actualWeight} kg
                        </p>
                    )}

                    {pickup.finalAmount > 0 && (
                        <p>
                            💰 <strong>${t("finalAmount")}:</strong>{" "}
                            ₹{pickup.finalAmount}
                        </p>
                    )}

                   {/* pickup status */} 
                   {user.role === "COLLECTOR" &&
    pickup.status === "ACCEPTED" && (
        <button
            onClick={() =>
                updatePickupStatus(
                    pickup._id,
                    "ON_WAY"
                )
            }
        >
            🚚 {t("onTheWay")}
        </button>
    )}
{user.role === "COLLECTOR" &&
    pickup.status === "ON_WAY" && (
        <button
            onClick={() =>
                updatePickupStatus(
                    pickup._id,
                    "ARRIVED"
                )
            }
        >
            📍 {t("arrived")}
        </button>
    )}

    {user.role === "COLLECTOR" &&
    pickup.status === "ARRIVED" && (
        <div className="complete-pickup">

            <h4 style={{ marginTop: 0 }}>
                ♻️ Scrap Segregation & Digital Weighing
            </h4>

            <p style={{ marginTop: "4px", color: "#66756c" }}>
                Enter the actual weight collected for each scrap category.
            </p>

            <div
                className="segregation-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "10px",
                    margin: "14px 0",
                }}
            >
                {Object.keys(segregationWeights).map((category) => (
                    <label
                        key={category}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                        }}
                    >
                        <span>
                            {category === "Paper" && "📄 "}
                            {category === "Plastic" && "🧴 "}
                            {category === "Metal" && "🔩 "}
                            {category === "E-waste" && "💻 "}
                            {category === "Cardboard" && "📦 "}
                            {category}
                        </span>

                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0 kg"
                            value={segregationWeights[category]}
                            onChange={(e) =>
                                updateSegregationWeight(
                                    category,
                                    e.target.value
                                )
                            }
                        />
                    </label>
                ))}
            </div>

            <div
                className="calculation"
                style={{
                    marginTop: "10px",
                    marginBottom: "14px",
                }}
            >
                <p>
                    Total segregated weight:
                    <strong style={{ marginLeft: "8px" }}>
                        {segregationTotal.toFixed(1)} kg
                    </strong>
                </p>
            </div>

            <label>
                ⚖️ {t("actualWeightKg")}
            </label>

            <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder={t("enterActualWeight")}
                value={actualWeight}
                onChange={(e) =>
                    setActualWeight(e.target.value)
                }
            />

            <button
                type="button"
                onClick={() => {
                    if (segregationTotal <= 0) {
                        alert("Please enter at least one segregated scrap weight.");
                        return;
                    }

                    setActualWeight(segregationTotal.toFixed(1));
                }}
                style={{ marginBottom: "10px" }}
            >
                ⚖️ Use Segregated Total
            </button>

            <button
                onClick={() =>
                    completePickup(pickup._id)
                }
            >
                ✅ {t("completePickup")}
            </button>

        </div>
    )}

   {pickup.status === "COMPLETED" && (
    <div className="digital-receipt">

        <h4>🧾 {t("digitalReceipt")}</h4>

        <p>
            <strong>${t("receiptNo")}:</strong>{" "}
            {pickup.receiptNo || "N/A"}
        </p>

        <p>
            <strong>${t("finalAmount")}:</strong>{" "}
            ₹{pickup.finalAmount}
        </p>

        <p>
            <strong>{t("paymentStatus")}:</strong>{" "}
            {pickup.paymentStatus === "PAID" ? (
                <span style={{ color: "#176b43", fontWeight: "600" }}>
                    ✅ {t("paid")}
                </span>
            ) : (
                <span style={{ color: "#b7791f", fontWeight: "600" }}>
                    ⏳ {t("pending")}
                </span>
            )}
        </p>

        {user.role === "USER" &&
            pickup.paymentStatus === "PENDING" && (
                <button
                    type="button"
                    onClick={() => confirmPayment(pickup._id)}
                >
                    💰 {t("confirmPayment")}
                </button>
            )}

        <button
            type="button"
            className="receipt-button"
            onClick={() => openReceipt(pickup)}
        >
            🧾 {t("viewFullReceipt")}
        </button>

        {user.role === "USER" && (
            <ReviewForm pickupId={pickup._id} />
        )}

    </div>
)}

{statusMessage && (
    <div className="success-message">
        {statusMessage}
    </div>
)}


                </div>

            ))}

        </div>
    )}

</section>


                {/* Scrap Price List */}

                <section className="panel">

                    <h3>
                        ♻️ {t("scrapPriceList")}
                    </h3>

                    <div className="grid">

                        {scrap.map(item => (

                            <div
                                className="item"
                                key={item._id}
                            >

                                <b>
                                    {item.name}
                                </b>

                                <span>
                                    ₹{item.rate}/kg
                                </span>

                            </div>

                        ))}

                    </div>

                </section>


                {/* Price Calculator */}

                <section className="panel">

                    <h3>
                        🧮 {t("scrapPriceCalculator")}
                    </h3>

                    <div className="calculator">

                        <label>
                            {t("selectScrap")}
                        </label>

                        <select
                            value={selectedScrap}
                            onChange={(e) =>
                                setSelectedScrap(e.target.value)
                            }
                        >

                            <option value="">
                                {t("selectMaterial")}
                            </option>

                            {scrap.map(item => (

                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.name} — ₹{item.rate}/kg
                                </option>

                            ))}

                        </select>


                        <label>
                            {t("weightKg")}
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder={t("enterWeight")}
                            value={weight}
                            onChange={(e) =>
                                setWeight(e.target.value)
                            }
                        />


                        {selectedMaterial && (

                            <div className="calculation">

                                <p>
                                    Rate:
                                    <strong>
                                        ₹{selectedMaterial.rate}/kg
                                    </strong>
                                </p>

                                <p>
                                    Weight:
                                    <strong>
                                        {weight || 0} kg
                                    </strong>
                                </p>

                                <hr />

                                <h2>
                                    {t("estimatedValue")}:
                                    <br />
                                    ₹{estimatedPrice.toFixed(2)}
                                </h2>

                            </div>

                        )}

                    </div>

                </section>

                <CreateScrapLot />


                {/* Main Flow */}

                <section className="panel">

                    <h3>
                        🚀 {t("ecoscrapFlow")}
                    </h3>

                    <div className="flow">

                        {t("selectScrap")} → {t("enterWeightLabel")} →
                        {t("calculatePrice")} → {t("bookPickup")} →
                        {t("collector")} → {t("weighing")} → {t("payment")} →
                        {t("recycler")} → {t("traceability")}

                    </div>

                </section>
                    </>
                )}

            </main>

            </div>
        </DashboardLayout>
    );
}


export default UserDashboard;
