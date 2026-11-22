
function CreateListing({
    material,
    setMaterial,
    kg,
    setKg,
    price,
    setPrice,
    createListing,
    message,
    user,
    onRequireAuth
}) {
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!user) {
            onRequireAuth?.();
            return;
        }

        createListing(e);
    };

    return (
        <div className="marketplace-create">
            <h4>➕ Create Marketplace Listing</h4>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Material (e.g. Cardboard)"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Quantity (kg)"
                    value={kg}
                    onChange={(e) => setKg(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Price per kg (₹)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <button type="submit">
                    ➕ Create Listing
                </button>
            </form>

            {message && (
                <p className="marketplace-message">
                    {message}
                </p>
            )}
        </div>
    );
}

export default CreateListing;
