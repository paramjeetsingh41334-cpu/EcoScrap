import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";

function getCurrentPosition() {
    if (!("geolocation" in navigator)) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            () => resolve(null),
            {
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 30000
            }
        );
    });
}

function formatTime(minutes) {
    if (!Number.isFinite(minutes) || minutes <= 0) return "0 min";

    const rounded = Math.max(1, Math.round(minutes));
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;

    if (hours && mins) return `${hours} hr ${mins} min`;
    if (hours) return `${hours} hr`;
    return `${mins} min`;
}

function SmartRoute() {
    const [smartRoute, setSmartRoute] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState("");
    const [locationStatus, setLocationStatus] = useState("Checking location...");
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadSmartRoute = useCallback(async () => {
        try {
            setRouteLoading(true);
            setRouteError("");

            const position = await getCurrentPosition();
            const params = new URLSearchParams();

            if (position) {
                const { latitude, longitude } = position.coords;
                params.set("latitude", latitude.toFixed(6));
                params.set("longitude", longitude.toFixed(6));
                params.set("clientMinutes", String(
                    new Date().getHours() * 60 + new Date().getMinutes()
                ));
                setLocationStatus("Using your current location");
            } else {
                setLocationStatus("Using pickup locations as fallback");
            }

            const query = params.toString();
            const data = await api(
                `/pickups/smart-route${query ? `?${query}` : ""}`
            );

            setSmartRoute(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Smart route error:", error);
            setRouteError(
                error.message || "Unable to calculate the smart route."
            );
        } finally {
            setRouteLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSmartRoute();

        const interval = setInterval(loadSmartRoute, 30000);

        const handleRefresh = () => loadSmartRoute();
        window.addEventListener("ecoscrap:route-refresh", handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener("ecoscrap:route-refresh", handleRefresh);
        };
    }, [loadSmartRoute]);

    const openNavigation = (stop) => {
        if (!Number.isFinite(Number(stop.latitude)) || !Number.isFinite(Number(stop.longitude))) {
            alert("Location coordinates are not available for this pickup.");
            return;
        }

        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${stop.latitude},${stop.longitude}`
        )}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const route = smartRoute?.route || [];

    return (
        <section className="panel smart-route-panel" id="smart-route-panel">
            <div className="smart-route-header">
                <div>
                    <div className="smart-route-eyebrow">🚚 COLLECTOR LOGISTICS</div>
                    <h3>🧭 Smart Route Optimization</h3>
                    <p>
                        Plan the next pickup sequence using your location,
                        distance and pickup time slots.
                    </p>
                </div>

                <button
                    type="button"
                    className="smart-route-refresh"
                    onClick={loadSmartRoute}
                    disabled={routeLoading}
                >
                    {routeLoading ? "⏳ Calculating..." : "🔄 Recalculate Route"}
                </button>
            </div>

            <div className="smart-route-location">
                <span>📍</span>
                <span>{locationStatus}</span>
                {lastUpdated && (
                    <span className="smart-route-updated">
                        Updated {lastUpdated.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                )}
            </div>

            {routeError && (
                <div className="error-message">❌ {routeError}</div>
            )}

            {!routeLoading && smartRoute?.message && route.length === 0 && (
                <div className="smart-route-empty">
                    <div className="smart-route-empty-icon">🗺️</div>
                    <strong>No active location-enabled pickups</strong>
                    <p>{smartRoute.message}</p>
                    <button type="button" onClick={loadSmartRoute}>
                        🔄 Check Again
                    </button>
                </div>
            )}

            {route.length > 0 && (
                <>
                    <div className="smart-route-summary">
                        <div className="smart-route-stat">
                            <span>📍</span>
                            <div>
                                <small>Stops</small>
                                <strong>{smartRoute.totalStops}</strong>
                            </div>
                        </div>

                        <div className="smart-route-stat">
                            <span>🛣️</span>
                            <div>
                                <small>Estimated distance</small>
                                <strong>{smartRoute.totalDistanceKm} km</strong>
                            </div>
                        </div>

                        <div className="smart-route-stat">
                            <span>⏱️</span>
                            <div>
                                <small>Estimated trip</small>
                                <strong>{formatTime(smartRoute.estimatedTimeMinutes)}</strong>
                            </div>
                        </div>
                    </div>

                    <div
                        className="smart-route-time-breakdown"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "12px",
                            margin: "14px 0 10px"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 14px",
                                border: "1px solid #dce8e2",
                                borderRadius: "14px",
                                background: "#ffffff"
                            }}
                        >
                            <span style={{ fontSize: "22px" }}>🚗</span>
                            <div>
                                <small
                                    style={{
                                        display: "block",
                                        color: "#6b7280",
                                        marginBottom: "3px"
                                    }}
                                >
                                    Driving
                                </small>
                                <strong style={{ fontSize: "17px" }}>
                                    {formatTime(smartRoute.drivingTimeMinutes)}
                                </strong>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 14px",
                                border: "1px solid #dce8e2",
                                borderRadius: "14px",
                                background: "#ffffff"
                            }}
                        >
                            <span style={{ fontSize: "22px" }}>📦</span>
                            <div>
                                <small
                                    style={{
                                        display: "block",
                                        color: "#6b7280",
                                        marginBottom: "3px"
                                    }}
                                >
                                    Pickup handling
                                </small>
                                <strong style={{ fontSize: "17px" }}>
                                    {formatTime(smartRoute.handlingTimeMinutes)}
                                </strong>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 14px",
                                border: "1px solid #bfe4d0",
                                borderRadius: "14px",
                                background: "#eef9f3"
                            }}
                        >
                            <span style={{ fontSize: "22px" }}>⏱️</span>
                            <div>
                                <small
                                    style={{
                                        display: "block",
                                        color: "#167348",
                                        marginBottom: "3px"
                                    }}
                                >
                                    Total trip
                                </small>
                                <strong style={{ fontSize: "17px", color: "#0f5132" }}>
                                    {formatTime(smartRoute.estimatedTimeMinutes)}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="smart-route-note">
                        💡 Route uses road distance, travel time and pickup time slots.
                        Total trip time includes estimated pickup handling time.
                    </div>

                    <div className="smart-route-timeline">
                        {route.map((stop, index) => (
                            <div className="smart-route-stop" key={stop.pickupId}>
                                <div className="smart-route-marker">
                                    <span>{stop.order}</span>
                                </div>

                                {index < route.length - 1 && (
                                    <div className="smart-route-line" />
                                )}

                                <div className="smart-route-stop-card">
                                    <div className="smart-route-stop-top">
                                        <div>
                                            <div className="smart-route-stop-title">
                                                {stop.customer}
                                            </div>
                                            <div className="smart-route-stop-address">
                                                📍 {stop.address}
                                            </div>
                                        </div>

                                        <span className={`status ${String(stop.status || "").toLowerCase()}`}>
                                            {stop.status}
                                        </span>
                                    </div>

                                    <div className="smart-route-details">
                                        <span>🕐 {stop.slot || "Time slot unavailable"}</span>
                                        <span>🚗 {stop.distanceFromPreviousKm} km</span>
                                    </div>

                                    {stop.items?.length > 0 && (
                                        <div className="smart-route-items">
                                            {stop.items.map((item, itemIndex) => (
                                                <span key={itemIndex}>
                                                    ♻️ {item.scrap} · {item.estimatedWeight} kg
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="smart-route-navigate"
                                        onClick={() => openNavigation(stop)}
                                    >
                                        🧭 Navigate to this pickup
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="smart-route-footer">
                        <span>✅ Recommended sequence ready</span>
                        <span>🔄 Auto-refreshes every 30 seconds</span>
                    </div>
                </>
            )}
        </section>
    );
}

export default SmartRoute;
