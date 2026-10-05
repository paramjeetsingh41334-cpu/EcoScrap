import React, { useEffect, useState } from "react";
import { api } from "../api.js";

function WasteTraceability() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTraceability = async () => {
            try {
                // Use the user's pickup records as the source for the
                // end-to-end journey. This keeps traceability connected to
                // the actual EcoScrap pickup flow.
                const data = await api("/pickups/mine");
                setPickups(
                    Array.isArray(data)
                        ? data
                        : data?.pickups || []
                );
            } catch (err) {
                console.error("Traceability error:", err);
                setError(err.message || "Failed to load traceability");
            } finally {
                setLoading(false);
            }
        };

        loadTraceability();
    }, []);

    const getStage = (status) => {
        if (status === "COMPLETED") return "RECORD";
        if (status === "ARRIVED") return "COLLECT";
        if (status === "ON_WAY") return "COLLECT";
        if (status === "ACCEPTED") return "COLLECT";
        return "SEGREGATE";
    };

    return (
        <section className="card traceability-panel">
            <div className="traceability-header">
                <span className="section-eyebrow">WASTE JOURNEY</span>
                <h2>🔗 Waste Traceability</h2>
                <p>
                    Track your waste from segregation and pickup to digital
                    recording and responsible processing.
                </p>
            </div>

            {loading && <p>Loading traceability...</p>}

            {error && (
                <p style={{ color: "#b42318", fontWeight: 600 }}>
                    Failed to load traceability: {error}
                </p>
            )}

            {!loading && !error && pickups.length === 0 && (
                <div className="transaction-empty-state">
                    <div style={{ fontSize: 42 }}>📦</div>
                    <h3>No traceability records yet</h3>
                    <p>
                        Your waste journey will appear here after you book a
                        pickup.
                    </p>
                </div>
            )}

            {!loading && !error && pickups.length > 0 && (
                <div>
                    {pickups.map((pickup) => {
                        const stage = getStage(pickup.status);

                        return (
                            <article className="trace-card" key={pickup._id}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <div>
                                        <small>
                                            Waste Record #
                                            {String(pickup._id).slice(-6)}
                                        </small>
                                        <h3>
                                            ♻️{" "}
                                            {pickup.items?.length
                                                ? pickup.items
                                                      .map(
                                                          (item) =>
                                                              item.scrap
                                                                  ?.name ||
                                                              "Scrap"
                                                      )
                                                      .join(", ")
                                                : "Recycling Pickup"}
                                        </h3>
                                    </div>

                                    <span
                                        style={{
                                            padding: "7px 12px",
                                            borderRadius: "999px",
                                            background: "#e8f8ef",
                                            color: "#176b43",
                                            fontWeight: 700
                                        }}
                                    >
                                        {pickup.status || "REQUESTED"}
                                    </span>
                                </div>

                                <p>
                                    📍 <strong>Pickup:</strong>{" "}
                                    {pickup.address || "Address recorded"}
                                </p>

                                <p>
                                    📊 <strong>Current Stage:</strong>{" "}
                                    {stage}
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        marginTop: 14
                                    }}
                                >
                                    {[
                                        ["♻️", "SEGREGATE"],
                                        ["📱", "COLLECT"],
                                        ["⚖️", "RECORD"],
                                        ["🔗", "TRACE"],
                                        ["🏭", "RECYCLE / DISPOSE"]
                                    ].map(([icon, label]) => (
                                        <span
                                            key={label}
                                            style={{
                                                padding: "8px 11px",
                                                border: "1px solid #dce9e1",
                                                borderRadius: "999px",
                                                background:
                                                    label === stage ||
                                                    (label === "RECORD" &&
                                                        pickup.status ===
                                                            "COMPLETED")
                                                        ? "#dff7e9"
                                                        : "#fff",
                                                color: "#176b43",
                                                fontSize: 12,
                                                fontWeight: 700
                                            }}
                                        >
                                            {icon} {label}
                                        </span>
                                    ))}
                                </div>

                                {pickup.actualWeight > 0 && (
                                    <p>
                                        ⚖️ <strong>Recorded Weight:</strong>{" "}
                                        {pickup.actualWeight} kg
                                    </p>
                                )}

                                {pickup.finalAmount > 0 && (
                                    <p>
                                        🧾 <strong>Digital Record:</strong>{" "}
                                        ₹{pickup.finalAmount} ·{" "}
                                        {pickup.receiptNo || "Receipt pending"}
                                    </p>
                                )}

                                {pickup.status === "COMPLETED" && (
                                    <p style={{ color: "#176b43", fontWeight: 700 }}>
                                        ✓ Pickup recorded. Ready for responsible
                                        recycling / disposal tracking.
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default WasteTraceability;
