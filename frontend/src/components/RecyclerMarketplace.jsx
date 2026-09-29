import { useEffect, useState } from "react";
import { api } from "../api.js";
import CreateListing from "./CreateListing";
import MarketplaceCard from "./MarketplaceCard";

function RecyclerMarketplace() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [material, setMaterial] = useState("");
    const [kg, setKg] = useState("");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");

    const [selectedListing, setSelectedListing] = useState(null);
    const [purchaseMessage, setPurchaseMessage] = useState("");

    const [scrapLots, setScrapLots] = useState([]);
    const [scrapLotMessage, setScrapLotMessage] = useState("");

    // Handover photo
    const [handoverPhoto, setHandoverPhoto] = useState(null);

    // Load marketplace listings
    useEffect(() => {
        api("/marketplace")
            .then((data) => {
                setListings(data);
            })
            .catch((error) => {
                console.error("Marketplace error:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Load digital scrap lots
    const loadScrapLots = async () => {
        try {
            const data = await api("/scrap-lots");
            setScrapLots(data.lots || []);
        } catch (error) {
            console.error("Scrap lots error:", error);
        }
    };

    useEffect(() => {
        loadScrapLots();
    }, []);

    // Create marketplace listing
    const createListing = async (e) => {
        e.preventDefault();

        if (!material || !kg || !price) {
            setMessage("Please fill all fields.");
            return;
        }

        try {
            await api("/marketplace", {
                method: "POST",
                body: JSON.stringify({
                    material,
                    kg: Number(kg),
                    askingPricePerKg: Number(price)
                })
            });

            setMessage("✅ Listing created successfully!");

            setMaterial("");
            setKg("");
            setPrice("");

            const updatedListings = await api("/marketplace");
            setListings(updatedListings);
        } catch (error) {
            setMessage(error.message);
        }
    };

    // View listing details
    const viewDetails = (listing) => {
        setSelectedListing(listing);
    };

    // Request marketplace purchase
    const requestPurchase = async (listing) => {
        try {
            await api(`/marketplace/${listing._id}/request`, {
                method: "PATCH"
            });

            setPurchaseMessage(
                "✅ Purchase request sent successfully!"
            );

            const updatedListings = await api("/marketplace");
            setListings(updatedListings);
        } catch (error) {
            setPurchaseMessage(error.message);
        }
    };

    // Request a digital scrap lot
    const requestScrapLot = async (lot) => {
        try {
            await api(`/scrap-lots/${lot._id}/request`, {
                method: "POST"
            });

            setScrapLotMessage(
                "✅ Recycler request sent successfully."
            );

            await loadScrapLots();
        } catch (error) {
            setScrapLotMessage(error.message);
        }
    };

    // Compress photo before sending to backend
    const compressPhoto = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const image = new Image();

                image.onload = () => {
                    const maxWidth = 1280;
                    const maxHeight = 1280;

                    let width = image.width;
                    let height = image.height;

                    if (
                        width > maxWidth ||
                        height > maxHeight
                    ) {
                        const scale = Math.min(
                            maxWidth / width,
                            maxHeight / height
                        );

                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                    }

                    const canvas =
                        document.createElement("canvas");

                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext("2d");

                    context.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    );

                    const compressedPhoto =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.7
                        );

                    resolve(compressedPhoto);
                };

                image.onerror = reject;
                image.src = reader.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Complete physical handover
    const completeHandover = async (lot) => {
        try {
            if (!handoverPhoto) {
                alert(
                    "📸 Please select a handover photo first."
                );
                return;
            }

            // 📍 Capture GPS location
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
                                    timeout: 10000,
                                    maximumAge: 60000
                                }
                            );
                        }
                    );

                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                } catch (locationError) {
                    console.warn(
                        "Handover location unavailable:",
                        locationError.message
                    );
                }
            }

            // 📸 Compress photo
            const photoUrl = await compressPhoto(
                handoverPhoto
            );

            const data = await api(
                `/handover/${lot._id}/complete`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        latitude,
                        longitude,
                        photoUrl
                    })
                }
            );

            alert(
                `✅ Handover completed!\nReceipt: ${data.handover.receiptNo}`
            );

            setHandoverPhoto(null);

            await loadScrapLots();
        } catch (error) {
            console.error("Handover error:", error);
            alert(error.message);
        }
    };

    return (
        <section className="marketplace-panel">

            {/* HEADER */}
            <div className="recycler-marketplace-header">
                <div>
                    <span className="recycler-marketplace-eyebrow">
                        RECYCLING MARKETPLACE
                    </span>

                    <h3>
                        <span className="recycler-marketplace-icon">
                            ♻️
                        </span>

                        Recycler Marketplace
                    </h3>

                    <p>
                        Buy recyclable materials from collectors
                        and organizations.
                    </p>
                </div>

                <div className="recycler-marketplace-badge">
                    ♻️ Sustainable Trading
                </div>
            </div>

            {/* DIGITAL SCRAP LOTS */}
            <section className="scrap-lots-section">
                <div className="scrap-lots-header">
                    <div>
                        <span className="scrap-lots-eyebrow">
                            DIGITAL INVENTORY
                        </span>

                        <h3>
                            <span className="scrap-lots-header-icon">
                                ♻️
                            </span>

                            Available Digital Scrap Lots
                        </h3>

                        <p>
                            Request collected scrap directly
                            from collectors.
                        </p>
                    </div>

                    {scrapLots.length > 0 && (
                        <span className="scrap-lots-count">
                            {scrapLots.length}{" "}
                            {scrapLots.length === 1
                                ? "Lot"
                                : "Lots"}
                        </span>
                    )}
                </div>

                {scrapLots.length === 0 && (
                    <div className="scrap-lots-empty">
                        <div className="scrap-lots-empty-icon">
                            📦
                        </div>

                        <h4>
                            No digital scrap lots available
                        </h4>

                        <p>
                            New collected scrap lots will appear
                            here.
                        </p>
                    </div>
                )}

                {scrapLots.length > 0 && (
                    <div className="scrap-lots-grid">
                        {scrapLots.map((lot) => (
                            <div
                                className="scrap-lot-card"
                                key={lot._id}
                            >
                                {lot.photoUrl && (
                                    <div className="scrap-lot-image-wrapper">
                                        <img
                                            src={lot.photoUrl}
                                            alt="Scrap"
                                            className="scrap-lot-card-image"
                                        />
                                    </div>
                                )}

                                <div className="scrap-lot-card-body">
                                    <div className="scrap-lot-card-top">
                                        <div className="scrap-lot-material-icon">
                                            📦
                                        </div>

                                        <span className="scrap-lot-available">
                                            AVAILABLE
                                        </span>
                                    </div>

                                    <h4>
                                        {lot.material?.name ||
                                            "Scrap Material"}
                                    </h4>

                                    <div className="scrap-lot-stats">
                                        <div className="scrap-lot-stat">
                                            <span>⚖️</span>

                                            <div>
                                                <small>Weight</small>
                                                <strong>
                                                    {lot.weight} kg
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="scrap-lot-stat">
                                            <span>💰</span>

                                            <div>
                                                <small>
                                                    Indicative Value
                                                </small>

                                                <strong>
                                                    ₹
                                                    {
                                                        lot.indicativePrice
                                                    }
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {lot.description && (
                                        <div className="scrap-lot-description">
                                            {lot.description}
                                        </div>
                                    )}

                                    <div className="scrap-lot-collector">
                                        <span className="scrap-collector-icon">
                                            👤
                                        </span>

                                        <div>
                                            <small>Collector</small>

                                            <strong>
                                                {lot.collector?.name ||
                                                    "Verified Collector"}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* REQUEST / HANDOVER */}
                                    {lot.requestStatus === "ACCEPTED" ? (
                                        <div className="scrap-handover-box">
                                            <div className="scrap-handover-heading">
                                                <span>🤝</span>

                                                <div>
                                                    <strong>
                                                        Handover Ready
                                                    </strong>

                                                    <small>
                                                        Upload proof to
                                                        complete the
                                                        transaction.
                                                    </small>
                                                </div>
                                            </div>

                                            <label className="handover-photo-label">
                                                📸 Handover Photo

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target.files?.[0] ||
                                                            null;

                                                        setHandoverPhoto(
                                                            file
                                                        );
                                                    }}
                                                />
                                            </label>

                                            {handoverPhoto && (
                                                <div className="handover-photo-selected">
                                                    📸 Photo selected:
                                                    <strong>
                                                        {
                                                            handoverPhoto.name
                                                        }
                                                    </strong>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className="complete-handover-button"
                                                onClick={() =>
                                                    completeHandover(
                                                        lot
                                                    )
                                                }
                                            >
                                                🤝 Complete Handover
                                            </button>
                                        </div>
                                    ) : lot.requestStatus ===
                                      "PENDING" ? (
                                        <button
                                            type="button"
                                            className="scrap-lot-pending-button"
                                            disabled
                                        >
                                            ⏳ Request Pending
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="request-scrap-lot-button"
                                            onClick={() =>
                                                requestScrapLot(
                                                    lot
                                                )
                                            }
                                        >
                                            📦 Request Scrap Lot
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {scrapLotMessage && (
                    <p className="marketplace-message">
                        {scrapLotMessage}
                    </p>
                )}
            </section>

            {/* CREATE MARKETPLACE LISTING */}
            <CreateListing
                material={material}
                setMaterial={setMaterial}
                kg={kg}
                setKg={setKg}
                price={price}
                setPrice={setPrice}
                createListing={createListing}
                message={message}
            />

            {/* MARKETPLACE LISTINGS */}
            <section className="marketplace-listings-section">
                <div className="marketplace-listings-header">
                    <div>
                        <span className="marketplace-listings-eyebrow">
                            MATERIAL MARKETPLACE
                        </span>

                        <h3>
                            <span className="marketplace-listings-icon">
                                📦
                            </span>

                            Available Listings
                        </h3>

                        <p>
                            Browse recyclable materials available
                            from verified sellers.
                        </p>
                    </div>

                    {!loading && listings.length > 0 && (
                        <span className="marketplace-listings-count">
                            {listings.length}{" "}
                            {listings.length === 1
                                ? "Listing"
                                : "Listings"}
                        </span>
                    )}
                </div>

                {loading && (
                    <div className="marketplace-loading-state">
                        <div className="marketplace-loading-icon">
                            📦
                        </div>

                        <p>Loading marketplace...</p>
                    </div>
                )}

                {!loading && listings.length === 0 && (
                    <div className="marketplace-empty-state">
                        <div className="marketplace-empty-icon">
                            📦
                        </div>

                        <h4>
                            No marketplace listings available
                        </h4>

                        <p>
                            New recyclable material listings will
                            appear here.
                        </p>
                    </div>
                )}

                {!loading && listings.length > 0 && (
                    <div className="marketplace-grid">
                        {listings.map((item) => (
                            <MarketplaceCard
                                key={item._id}
                                item={item}
                                selectedListing={selectedListing}
                                viewDetails={viewDetails}
                                requestPurchase={requestPurchase}
                            />
                        ))}
                    </div>
                )}

                {purchaseMessage && (
                    <p className="marketplace-message">
                        {purchaseMessage}
                    </p>
                )}
            </section>
        </section>
    );
}

export default RecyclerMarketplace;