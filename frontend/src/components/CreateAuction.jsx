import { useState } from "react";
import { api } from "../api.js";

function CreateAuction({ onCreated, organizationMode = false }) {
    const MIN_WEIGHT = organizationMode ? 50 : 1;

    const [title, setTitle] = useState("");
    const [material, setMaterial] = useState("");
    const [estimatedKg, setEstimatedKg] = useState("");
    const [startingBid, setStartingBid] = useState("");
    const [endsAt, setEndsAt] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const createAuction = async (e) => {
        e.preventDefault();
        setMessage("");

        const kg = Number(estimatedKg);

        if (organizationMode && kg < 50) {
            setMessage("❌ Organization auctions require at least 50 kg.");
            return;
        }

        setLoading(true);

        try {
            const data = await api("/auctions", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    material,
                    estimatedKg: kg,
                    startingBid: Number(startingBid),
                    endsAt
                })
            });

            setMessage("✅ Auction created successfully!");

            setTitle("");
            setMaterial("");
            setEstimatedKg("");
            setStartingBid("");
            setEndsAt("");

            if (onCreated) {
                onCreated(data);
            }
        } catch (error) {
            setMessage(`❌ ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auction-create-card">
            <div className="auction-create-header">
                <div>
                    <div className="auction-eyebrow">
                        {organizationMode ? "BULK MARKETPLACE" : "LIVE MARKETPLACE"}
                    </div>

                    <h3 className="auction-create-title">
                        {organizationMode
                            ? "Create Organization Bulk Auction"
                            : "Create Live Auction"}
                    </h3>

                    <p className="auction-create-description">
                        {organizationMode
                            ? "Sell 50kg+ bulk scrap from your organization through live recycler bidding."
                            : "Sell a bulk scrap lot through live bidding."}
                    </p>
                </div>

                <div className="auction-create-icon">
                    {organizationMode ? "🏢" : "🔨"}
                </div>
            </div>

            {organizationMode && (
                <div className="auction-bulk-notice">
                    <span className="auction-notice-icon">✓</span>
                    <div>
                        <strong>Minimum bulk quantity: 50 kg</strong>
                        <p>Organization auctions must contain at least 50 kg of scrap.</p>
                    </div>
                </div>
            )}

            <form className="auction-form" onSubmit={createAuction}>
                <div className="auction-form-grid">
                    <div className="auction-field auction-field-wide">
                        <label htmlFor="auction-title">Auction Title</label>
                        <input
                            id="auction-title"
                            type="text"
                            placeholder={
                                organizationMode
                                    ? "Example: College E-Waste Bulk Lot"
                                    : "Example: 100kg Mixed Metal Scrap"
                            }
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auction-field">
                        <label htmlFor="auction-material">Material</label>
                        <input
                            id="auction-material"
                            type="text"
                            placeholder="Example: Metal / Plastic / E-Waste"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auction-field">
                        <label htmlFor="auction-weight">Estimated Weight</label>
                        <div className="auction-input-with-suffix">
                            <input
                                id="auction-weight"
                                type="number"
                                min={MIN_WEIGHT}
                                step="0.1"
                                placeholder={organizationMode ? "50" : "100"}
                                value={estimatedKg}
                                onChange={(e) => setEstimatedKg(e.target.value)}
                                required
                            />
                            <span>kg</span>
                        </div>
                    </div>

                    <div className="auction-field">
                        <label htmlFor="auction-bid">Starting Bid</label>
                        <div className="auction-input-with-prefix">
                            <span>₹</span>
                            <input
                                id="auction-bid"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="30"
                                value={startingBid}
                                onChange={(e) => setStartingBid(e.target.value)}
                                required
                            />
                            <small>/kg</small>
                        </div>
                    </div>

                    <div className="auction-field">
                        <label htmlFor="auction-end">Auction End Time</label>
                        <input
                            id="auction-end"
                            type="datetime-local"
                            value={endsAt}
                            onChange={(e) => setEndsAt(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="auction-form-footer">
                    <div className="auction-form-tip">
                        <span>💡</span>
                        <div>
                            <strong>Tips for a successful auction</strong>
                            <p>
                                Use a clear title, accurate weight, and a competitive
                                starting bid to attract more recycler bids.
                            </p>
                        </div>
                    </div>

                    <button
                        className="auction-submit-button"
                        type="submit"
                        disabled={loading}
                    >
                        <span>{loading ? "⏳" : organizationMode ? "🏢" : "🔨"}</span>
                        {loading
                            ? "Creating..."
                            : organizationMode
                                ? "Create Bulk Auction"
                                : "Create Auction"}
                    </button>
                </div>
            </form>

            {message && (
                <div
                    className={`auction-form-message ${
                        message.startsWith("❌")
                            ? "auction-message-error"
                            : "auction-message-success"
                    }`}
                >
                    {message}
                </div>
            )}
        </section>
    );
}

export default CreateAuction;
