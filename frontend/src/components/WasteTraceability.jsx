import React, { useEffect, useState } from "react";
import { api } from "../api.js";

function WasteTraceability() {
    const [traces, setTraces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTraces = async () => {
            try {
                const data = await api("/trace/mine");

                if (Array.isArray(data)) {
                    setTraces(data);
                } else if (Array.isArray(data.traces)) {
                    setTraces(data.traces);
                } else {
                    setTraces([]);
                }
            } catch (err) {
                console.error("Traceability error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTraces();
    }, []);

    return (
        <section
            className="waste-traceability-section"
            id="waste-traceability"
        >
            {/* HEADER */}
            <div className="waste-traceability-header">
                <div>
                    <span className="waste-traceability-eyebrow">
                        WASTE JOURNEY
                    </span>

                    <h2>
                        <span className="waste-traceability-icon">
                            📦
                        </span>
                        Waste Traceability
                    </h2>

                    <p>
                        Track your scrap from collection to
                        final handover with verified records.
                    </p>
                </div>

                {!loading && !error && traces.length > 0 && (
                    <div className="traceability-count">
                        {traces.length}{" "}
                        {traces.length === 1
                            ? "Record"
                            : "Records"}
                    </div>
                )}
            </div>

            {/* LOADING */}
            {loading && (
                <div className="traceability-loading">
                    <div className="traceability-loading-icon">
                        📦
                    </div>
                    <p>Loading traceability records...</p>
                </div>
            )}

            {/* ERROR */}
            {error && (
                <div className="traceability-error">
                    <div className="traceability-error-icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Failed to load traceability
                        </strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* EMPTY */}
            {!loading && !error && traces.length === 0 && (
                <div className="traceability-empty">
                    <div className="traceability-empty-icon">
                        📦
                    </div>

                    <h4>No traceability records yet</h4>

                    <p>
                        Your waste journey will appear here
                        once a scrap item has been recorded.
                    </p>
                </div>
            )}

            {/* TRACE RECORDS */}
            {!loading && !error && traces.length > 0 && (
                <div className="traceability-list">
                    {traces.map((trace) => {
                        const scrapLotId =
                            trace.scrapLot?._id ||
                            trace.scrapLot;

                        const handover = trace.handover;

                        return (
                            <article
                                className="traceability-card"
                                key={trace._id}
                                id={`trace-${scrapLotId}`}
                            >
                                {/* CARD HEADER */}
                                <div className="traceability-card-header">
                                    <div className="traceability-stage-icon">
                                        ♻️
                                    </div>

                                    <div className="traceability-stage-info">
                                        <span>
                                            TRACEABILITY STAGE
                                        </span>

                                        <h3>
                                            {trace.stage?.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </h3>
                                    </div>
                                </div>

                                {/* NOTE */}
                                {trace.note && (
                                    <div className="traceability-note">
                                        {trace.note}
                                    </div>
                                )}

                                {/* SCRAP DETAILS */}
                                <div className="traceability-details">
                                    {trace.scrapLot && (
                                        <div className="traceability-detail">
                                            <span className="trace-detail-icon">
                                                ♻️
                                            </span>

                                            <div>
                                                <small>
                                                    Material
                                                </small>

                                                <strong>
                                                    {trace.scrapLot
                                                        .material
                                                        ?.name ||
                                                        "Scrap"}
                                                </strong>
                                            </div>
                                        </div>
                                    )}

                                    {trace.scrapLot?.weight !==
                                        undefined && (
                                        <div className="traceability-detail">
                                            <span className="trace-detail-icon">
                                                ⚖️
                                            </span>

                                            <div>
                                                <small>
                                                    Weight
                                                </small>

                                                <strong>
                                                    {
                                                        trace
                                                            .scrapLot
                                                            .weight
                                                    }{" "}
                                                    kg
                                                </strong>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* HANDOVER PROOF */}
                                {handover && (
                                    <div className="traceability-handover">
                                        <div className="handover-header">
                                            <div className="handover-icon">
                                                🤝
                                            </div>

                                            <div>
                                                <span>
                                                    VERIFIED RECORD
                                                </span>

                                                <h4>
                                                    Handover Proof
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="handover-details">
                                            <div className="handover-detail">
                                                <span>🧾</span>
                                                <div>
                                                    <small>
                                                        Receipt
                                                    </small>

                                                    <strong>
                                                        {handover.receiptNo ||
                                                            "N/A"}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="handover-detail">
                                                <span>⚖️</span>
                                                <div>
                                                    <small>
                                                        Final Weight
                                                    </small>

                                                    <strong>
                                                        {handover.weight ||
                                                            0}{" "}
                                                        kg
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="handover-detail">
                                                <span>💰</span>
                                                <div>
                                                    <small>
                                                        Final Amount
                                                    </small>

                                                    <strong>
                                                        ₹
                                                        {handover.finalAmount ||
                                                            0}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="handover-detail">
                                                <span>🕐</span>
                                                <div>
                                                    <small>
                                                        Handover Time
                                                    </small>

                                                    <strong>
                                                        {handover.handoverDate
                                                            ? new Date(
                                                                  handover.handoverDate
                                                              ).toLocaleString()
                                                            : "N/A"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* GPS */}
                                        {handover.latitude !== null &&
                                            handover.longitude !==
                                                null && (
                                                <div className="handover-location">
                                                    <div className="location-heading">
                                                        <span>
                                                            📍
                                                        </span>

                                                        <strong>
                                                            GPS Location
                                                        </strong>
                                                    </div>

                                                    <p>
                                                        Latitude:{" "}
                                                        {
                                                            handover.latitude
                                                        }
                                                        <br />
                                                        Longitude:{" "}
                                                        {
                                                            handover.longitude
                                                        }
                                                    </p>

                                                    <a
                                                        href={`https://www.google.com/maps?q=${handover.latitude},${handover.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="handover-map-link"
                                                    >
                                                        🗺️ View Handover
                                                        Location
                                                    </a>
                                                </div>
                                            )}

                                        {/* PHOTO */}
                                        {handover.photoUrl && (
                                            <div className="handover-photo">
                                                <div className="photo-heading">
                                                    <span>
                                                        📸
                                                    </span>

                                                    <strong>
                                                        Handover Photo
                                                    </strong>
                                                </div>

                                                <img
                                                    src={
                                                        handover.photoUrl
                                                    }
                                                    alt="Handover proof"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* CREATED DATE */}
                                <div className="traceability-created">
                                    {trace.createdAt
                                        ? new Date(
                                              trace.createdAt
                                          ).toLocaleString()
                                        : ""}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default WasteTraceability;