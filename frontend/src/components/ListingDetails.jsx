function ListingDetails({ item }) {
    return (
        <div className="listing-details">

            <div className="listing-detail-row">
                <div className="listing-detail-icon">
                    ♻️
                </div>

                <div>
                    <span>Material</span>
                    <strong>{item.material}</strong>
                </div>
            </div>

            <div className="listing-detail-row">
                <div className="listing-detail-icon">
                    ⚖️
                </div>

                <div>
                    <span>Quantity</span>
                    <strong>{item.kg} kg</strong>
                </div>
            </div>

            <div className="listing-detail-row">
                <div className="listing-detail-icon">
                    ₹
                </div>

                <div>
                    <span>Price</span>
                    <strong>
                        ₹{item.askingPricePerKg} / kg
                    </strong>
                </div>
            </div>

            <div className="listing-detail-row listing-status-row">
                <div className="listing-detail-icon">
                    ●
                </div>

                <div>
                    <span>Status</span>

                    <strong
                        className={
                            item.status === "OPEN"
                                ? "listing-status-open"
                                : "listing-status-other"
                        }
                    >
                        {item.status || "OPEN"}
                    </strong>
                </div>
            </div>

        </div>
    );
}

export default ListingDetails;