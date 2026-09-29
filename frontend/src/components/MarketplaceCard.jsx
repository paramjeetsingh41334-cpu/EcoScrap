import ListingDetails from "./ListingDetails";

function MarketplaceCard({
    item,
    selectedListing,
    viewDetails,
    requestPurchase
}) {
    const sellerRole = item.seller?.role;

    return (
        <div className="marketplace-card">
            <div className="marketplace-card-top">
                <div className="marketplace-card-icon">📦</div>

                <span className="marketplace-card-status">
                    AVAILABLE
                </span>
            </div>

            <div className="marketplace-card-content">
                <h4>{item.material}</h4>

                <div className="marketplace-price">
                    <strong>₹{item.askingPricePerKg}</strong>
                    <span>/ kg</span>
                </div>

                <div className="marketplace-quantity">
                    <span className="marketplace-detail-icon">⚖️</span>
                    <div>
                        <span>Available Quantity</span>
                        <strong>{item.kg} kg</strong>
                    </div>
                </div>

                {item.seller && (
                    <div className="marketplace-seller">
                        <div className="marketplace-seller-avatar">
                            👤
                        </div>

                        <div className="marketplace-seller-info">
                            <span>Seller</span>

                            <strong>
                                {item.seller.name || "Seller"}
                            </strong>
                        </div>

                        <div className="marketplace-verification">
                            {item.seller.verified &&
                                sellerRole === "COLLECTOR" && (
                                    <span className="seller-verified collector">
                                        🚚 Verified Collector
                                    </span>
                                )}

                            {item.seller.verified &&
                                sellerRole === "ORGANIZATION" && (
                                    <span className="seller-verified organization">
                                        🏢 Verified Organization
                                    </span>
                                )}

                            {!item.seller.verified && (
                                <span className="seller-not-verified">
                                    ⏳ Not Verified
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="marketplace-card-actions">
                    <button
                        className="marketplace-details-button"
                        onClick={() => viewDetails(item)}
                    >
                        View Details
                        <span>→</span>
                    </button>

                    <button
                        className="marketplace-purchase-button"
                        onClick={() => requestPurchase(item)}
                    >
                        🛒 Request Purchase
                    </button>
                </div>

                {selectedListing?._id === item._id && (
                    <ListingDetails item={item} />
                )}
            </div>
        </div>
    );
}

export default MarketplaceCard;