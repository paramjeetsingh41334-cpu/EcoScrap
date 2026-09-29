import { useEffect, useState } from "react";
import { api } from "../api.js";

function RecyclingCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [handovers, setHandovers] = useState([]);
    const [generating, setGenerating] = useState("");

    const loadCertificates = async () => {
        try {
            const [certificateData, traceData] = await Promise.all([
                api("/certificates/mine"),
                api("/trace/mine")
            ]);

            setCertificates(certificateData.certificates || []);

            const completedHandovers = Array.isArray(traceData)
                ? traceData
                      .map((trace) => trace.handover)
                      .filter(
                          (handover) =>
                              handover &&
                              handover.status === "COMPLETED"
                      )
                : [];

            const uniqueHandovers = completedHandovers.filter(
                (handover, index, array) =>
                    index ===
                    array.findIndex(
                        (item) =>
                            String(item._id) ===
                            String(handover._id)
                    )
            );

            setHandovers(uniqueHandovers);
        } catch (error) {
            console.error("Certificate error:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCertificates();
    }, []);

    const hasCertificate = (handoverId) => {
        return certificates.some(
            (certificate) =>
                String(
                    certificate.handover?._id ||
                        certificate.handover
                ) === String(handoverId)
        );
    };

    const generateCertificate = async (handoverId) => {
        try {
            setGenerating(handoverId);

            const data = await api(
                `/certificates/generate/${handoverId}`,
                {
                    method: "POST"
                }
            );

            setMessage(`✅ ${data.message}`);

            await loadCertificates();
        } catch (error) {
            alert(error.message);
        } finally {
            setGenerating("");
        }
    };

    const printCertificate = (certificate) => {
        const material =
            certificate.material?.name ||
            "Recyclable Material";

        const collector =
            certificate.collector?.name || "Collector";

        const recycler =
            certificate.recycler?.name || "Recycler";

        const handoverDate =
            certificate.handover?.handoverDate
                ? new Date(
                      certificate.handover.handoverDate
                  ).toLocaleString()
                : new Date(
                      certificate.certificateDate
                  ).toLocaleString();

        const certificateWindow = window.open(
            "",
            "_blank",
            "width=800,height=900"
        );

        if (!certificateWindow) {
            alert(
                "Please allow popups for this website."
            );
            return;
        }

        certificateWindow.document.write(`
            <html>
                <head>
                    <title>
                        ${certificate.certificateNo}
                    </title>

                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: #f5f7f6;
                            padding: 40px;
                        }

                        .certificate {
                            max-width: 700px;
                            margin: auto;
                            background: white;
                            padding: 45px;
                            border: 8px solid #176b43;
                            border-radius: 18px;
                            text-align: center;
                        }

                        h1 {
                            color: #176b43;
                            margin-bottom: 5px;
                        }

                        h2 {
                            margin-top: 5px;
                        }

                        .certificate-no {
                            color: #555;
                            margin: 20px 0;
                        }

                        .details {
                            text-align: left;
                            margin-top: 30px;
                        }

                        .details p {
                            font-size: 17px;
                            margin: 14px 0;
                        }

                        .verified {
                            margin-top: 30px;
                            color: #176b43;
                            font-weight: bold;
                            font-size: 18px;
                        }

                        .footer {
                            margin-top: 35px;
                            color: #555;
                        }

                        button {
                            margin-top: 25px;
                            padding: 12px 22px;
                            border: 0;
                            border-radius: 8px;
                            background: #176b43;
                            color: white;
                            font-size: 16px;
                            cursor: pointer;
                        }

                        @media print {
                            button {
                                display: none;
                            }

                            body {
                                background: white;
                            }
                        }
                    </style>
                </head>

                <body>
                    <div class="certificate">
                        <h1>♻️ EcoScrap</h1>

                        <h2>
                            RECYCLING CERTIFICATE
                        </h2>

                        <p class="certificate-no">
                            Certificate ID:
                            <strong>
                                ${certificate.certificateNo}
                            </strong>
                        </p>

                        <div class="details">
                            <p>
                                <strong>
                                    ♻️ Material:
                                </strong>
                                ${material}
                            </p>

                            <p>
                                <strong>
                                    ⚖️ Recycled Weight:
                                </strong>
                                ${certificate.weight} kg
                            </p>

                            <p>
                                <strong>
                                    💰 Transaction Amount:
                                </strong>
                                ₹${certificate.amount}
                            </p>

                            <p>
                                <strong>
                                    🧾 Receipt:
                                </strong>
                                ${certificate.receiptNo}
                            </p>

                            <p>
                                <strong>
                                    👤 Collector:
                                </strong>
                                ${collector}
                            </p>

                            <p>
                                <strong>
                                    ♻️ Recycler:
                                </strong>
                                ${recycler}
                            </p>

                            <p>
                                <strong>
                                    🕐 Handover Date:
                                </strong>
                                ${handoverDate}
                            </p>
                        </div>

                        <div class="verified">
                            ✅ VERIFIED RECYCLING TRANSACTION
                        </div>

                        <p class="footer">
                            This certificate confirms that
                            the above recyclable material was
                            transferred through the EcoScrap
                            recycling network.
                        </p>

                        <button
                            onclick="window.print()"
                        >
                            🖨️ Print / Save as PDF
                        </button>
                    </div>
                </body>
            </html>
        `);

        certificateWindow.document.close();
    };

    return (
        <section className="recycling-certificates-section">

            {/* HEADER */}
            <div className="certificates-header">
                <div>
                    <span className="certificates-eyebrow">
                        VERIFIED RECYCLING
                    </span>

                    <h3>
                        <span className="certificates-header-icon">
                            🏆
                        </span>

                        Recycling Certificates
                    </h3>

                    <p>
                        Generate verified certificates for
                        completed recycling transactions.
                    </p>
                </div>

                {certificates.length > 0 && (
                    <div className="certificates-count">
                        {certificates.length}{" "}
                        {certificates.length === 1
                            ? "Certificate"
                            : "Certificates"}
                    </div>
                )}
            </div>

            {/* LOADING */}
            {loading && (
                <div className="certificates-loading">
                    <div className="certificates-loading-icon">
                        🏆
                    </div>

                    <p>Loading certificates...</p>
                </div>
            )}

            {/* MESSAGE */}
            {message && (
                <p className="certificate-success-message">
                    {message}
                </p>
            )}

            {/* COMPLETED HANDOVERS */}
            {!loading && handovers.length > 0 && (
                <section className="completed-handovers-section">
                    <div className="completed-handovers-heading">
                        <div>
                            <span className="certificate-section-eyebrow">
                                ELIGIBLE TRANSACTIONS
                            </span>

                            <h4>
                                ♻️ Completed Handovers
                            </h4>
                        </div>

                        <span className="handover-count">
                            {handovers.length}
                        </span>
                    </div>

                    <div className="completed-handovers-grid">
                        {handovers.map((handover) => {
                            const alreadyGenerated =
                                hasCertificate(
                                    handover._id
                                );

                            return (
                                <div
                                    key={handover._id}
                                    className="completed-handover-card"
                                >
                                    <div className="handover-card-top">
                                        <div className="handover-card-icon">
                                            🤝
                                        </div>

                                        <span className="handover-completed-badge">
                                            COMPLETED
                                        </span>
                                    </div>

                                    <div className="handover-card-details">
                                        <div>
                                            <span>
                                                🧾 Receipt
                                            </span>

                                            <strong>
                                                {
                                                    handover.receiptNo
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                ⚖️ Weight
                                            </span>

                                            <strong>
                                                {handover.weight} kg
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                💰 Amount
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    handover.finalAmount
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    {alreadyGenerated ? (
                                        <div className="certificate-already-generated">
                                            <span>✅</span>

                                            Certificate already
                                            generated
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="generate-certificate-button"
                                            onClick={() =>
                                                generateCertificate(
                                                    handover._id
                                                )
                                            }
                                            disabled={
                                                generating ===
                                                handover._id
                                            }
                                        >
                                            {generating ===
                                            handover._id
                                                ? "Generating..."
                                                : "🏆 Generate Certificate"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* NO CERTIFICATES */}
            {!loading &&
                certificates.length === 0 && (
                    <div className="certificates-empty">
                        <div className="certificates-empty-icon">
                            🏆
                        </div>

                        <h4>
                            No recycling certificates yet
                        </h4>

                        <p>
                            Complete a recycling transaction
                            to generate your first certificate.
                        </p>
                    </div>
                )}

            {/* GENERATED CERTIFICATES */}
            {!loading && certificates.length > 0 && (
                <section className="generated-certificates-section">
                    <div className="generated-certificates-heading">
                        <div>
                            <span className="certificate-section-eyebrow">
                                YOUR RECORDS
                            </span>

                            <h4>
                                🏆 Generated Certificates
                            </h4>
                        </div>
                    </div>

                    <div className="generated-certificates-grid">
                        {certificates.map((certificate) => (
                            <div
                                key={certificate._id}
                                className="generated-certificate-card"
                            >
                                <div className="generated-certificate-top">
                                    <div className="certificate-card-icon">
                                        🏆
                                    </div>

                                    <span className="certificate-verified-badge">
                                        VERIFIED
                                    </span>
                                </div>

                                <h4>
                                    {certificate.certificateNo}
                                </h4>

                                <div className="certificate-card-details">
                                    <div>
                                        <span>
                                            ♻️ Material
                                        </span>

                                        <strong>
                                            {certificate.material
                                                ?.name ||
                                                "Scrap"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            ⚖️ Weight
                                        </span>

                                        <strong>
                                            {certificate.weight} kg
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            🧾 Receipt
                                        </span>

                                        <strong>
                                            {
                                                certificate.receiptNo
                                            }
                                        </strong>
                                    </div>
                                </div>

                                <div className="certificate-verified-row">
                                    <span>
                                        ✓
                                    </span>

                                    <strong>
                                        VERIFIED RECYCLING TRANSACTION
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    className="view-certificate-button"
                                    onClick={() =>
                                        printCertificate(
                                            certificate
                                        )
                                    }
                                >
                                    🖨️ View / Print Certificate
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </section>
    );
}

export default RecyclingCertificates;