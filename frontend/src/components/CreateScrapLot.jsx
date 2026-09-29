import { useEffect, useState } from "react";
import { api } from "../api.js";

function CreateScrapLot() {
    const [scrap, setScrap] = useState([]);
    const [material, setMaterial] = useState("");
    const [weight, setWeight] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadScrap();
    }, []);

    const loadScrap = async () => {
        try {
            const data = await api("/scrap");
            setScrap(data.scrap || data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.size > 700 * 1024) {
            alert("Please select an image smaller than 700 KB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setPhotoUrl(reader.result);
            setPhotoPreview(reader.result);
        };

        reader.readAsDataURL(file);
    };

    const selectedMaterial = scrap.find(
        (item) => item._id === material
    );

    const getSafetyGuidance = () => {
        if (!selectedMaterial) return null;

        const name = selectedMaterial.name.toLowerCase();

        if (name.includes("battery")) {
            return {
                title: "🔋 Battery Safety",
                points: [
                    "Do not burn or puncture batteries.",
                    "Do not open damaged batteries.",
                    "Keep damaged batteries separate.",
                    "Hand over batteries to an authorized recycler."
                ]
            };
        }

        if (
            name.includes("e-waste") ||
            name.includes("electronic")
        ) {
            return {
                title: "💻 E-Waste Safety",
                points: [
                    "Avoid unsafe dismantling.",
                    "Do not burn electronic components.",
                    "Keep hazardous parts separate.",
                    "Send e-waste through an authorized recycling channel."
                ]
            };
        }

        if (
            name.includes("cable") ||
            name.includes("wire")
        ) {
            return {
                title: "🔌 Cable Safety",
                points: [
                    "Do not burn cables to recover copper.",
                    "Avoid unsafe dismantling.",
                    "Keep cables separated from other materials.",
                    "Send cables to an appropriate recycler."
                ]
            };
        }

        if (
            name.includes("pcb") ||
            name.includes("circuit")
        ) {
            return {
                title: "🟢 PCB Safety",
                points: [
                    "Avoid breaking circuit boards unnecessarily.",
                    "Do not burn PCBs.",
                    "Keep electronic components separated.",
                    "Use a proper recycling channel."
                ]
            };
        }

        return {
            title: "♻️ Safe Scrap Handling",
            points: [
                "Keep scrap separated by material.",
                "Avoid burning or unsafe dismantling.",
                "Handle sharp or hazardous items carefully.",
                "Use an appropriate recycling channel."
            ]
        };
    };

    const safetyGuidance = getSafetyGuidance();

    const indicativePrice =
        selectedMaterial && weight
            ? Number(selectedMaterial.rate) * Number(weight)
            : 0;

    const createLot = async () => {
        if (!material || !weight) {
            alert("Please select material and enter weight.");
            return;
        }

        try {
            await api("/scrap-lots", {
                method: "POST",
                body: JSON.stringify({
                    material,
                    weight: Number(weight),
                    indicativePrice,
                    photoUrl,
                    description
                })
            });

            setMessage("✅ Digital scrap lot created successfully.");

            setMaterial("");
            setWeight("");
            setPhotoUrl("");
            setPhotoPreview("");
            setDescription("");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <section className="scrap-lot-create-card">

            {/* Header */}
            <div className="scrap-lot-header">

                <div>
                    <span className="scrap-lot-eyebrow">
                        SCRAP TRACEABILITY
                    </span>

                    <h3>
                        Create Digital Scrap Lot
                    </h3>

                    <p>
                        Create a digital record of collected scrap
                        before sending it to a recycler.
                    </p>
                </div>

                <div className="scrap-lot-header-icon">
                    ♻️
                </div>

            </div>

            {/* Form */}
            <div className="scrap-lot-form">

                {/* Photo */}
                <div className="scrap-lot-field scrap-lot-photo-field">

                    <label>
                        📷 Scrap Photo
                    </label>

                    <label className="scrap-photo-upload">

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhoto}
                        />

                        <span className="scrap-upload-icon">
                            📷
                        </span>

                        <span className="scrap-upload-content">
                            <strong>
                                Upload scrap photo
                            </strong>

                            <small>
                                JPG, PNG or WEBP • Max 700 KB
                            </small>
                        </span>

                        <span className="scrap-upload-button">
                            Choose File
                        </span>

                    </label>

                    {photoPreview && (
                        <div className="scrap-photo-preview">

                            <img
                                src={photoPreview}
                                alt="Scrap preview"
                            />

                            <div>
                                <strong>
                                    Photo selected
                                </strong>

                                <small>
                                    Ready to attach to this scrap lot.
                                </small>
                            </div>

                        </div>
                    )}

                </div>

                {/* Material + Weight */}
                <div className="scrap-lot-grid">

                    <div className="scrap-lot-field">

                        <label>
                            ♻️ Material
                        </label>

                        <select
                            value={material}
                            onChange={(e) =>
                                setMaterial(e.target.value)
                            }
                        >
                            <option value="">
                                Select material
                            </option>

                            {scrap.map((item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.name} — ₹{item.rate}/kg
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="scrap-lot-field">

                        <label>
                            ⚖️ Weight (kg)
                        </label>

                        <div className="scrap-input-suffix">

                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Enter weight"
                                value={weight}
                                onChange={(e) =>
                                    setWeight(e.target.value)
                                }
                            />

                            <span>kg</span>

                        </div>

                    </div>

                </div>

                {/* Calculation */}
                {selectedMaterial && weight && (
                    <div className="scrap-lot-calculation">

                        <div className="scrap-calculation-header">
                            <span>
                                Estimated lot value
                            </span>

                            <span className="scrap-calculation-icon">
                                ₹
                            </span>
                        </div>

                        <div className="scrap-calculation-details">

                            <div>
                                <small>Rate</small>
                                <strong>
                                    ₹{selectedMaterial.rate}/kg
                                </strong>
                            </div>

                            <div>
                                <small>Weight</small>
                                <strong>
                                    {weight} kg
                                </strong>
                            </div>

                            <div className="scrap-calculation-total">
                                <small>
                                    Indicative Value
                                </small>

                                <strong>
                                    ₹{indicativePrice.toFixed(2)}
                                </strong>
                            </div>

                        </div>

                    </div>
                )}

                {/* Safety Guidance */}
                {selectedMaterial && safetyGuidance && (
                    <div className="scrap-safety-guidance">

                        <div className="scrap-safety-heading">

                            <div className="scrap-safety-icon">
                                🛡️
                            </div>

                            <div>
                                <h4>
                                    {safetyGuidance.title}
                                </h4>

                                <p>
                                    Follow these guidelines when handling
                                    this material.
                                </p>
                            </div>

                        </div>

                        <ul>
                            {safetyGuidance.points.map(
                                (point, index) => (
                                    <li key={index}>
                                        <span>✓</span>
                                        {point}
                                    </li>
                                )
                            )}
                        </ul>

                    </div>
                )}

                {/* Description */}
                <div className="scrap-lot-field">

                    <label>
                        📝 Description
                    </label>

                    <textarea
                        placeholder="Describe the scrap, condition, source or any other useful details..."
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        rows="4"
                    />

                </div>

                {/* Footer */}
                <div className="scrap-lot-footer">

                    <div className="scrap-lot-tip">
                        <span>💡</span>

                        <div>
                            <strong>
                                Keep your scrap record accurate
                            </strong>

                            <p>
                                Add a clear photo, correct weight and
                                material details for better traceability.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="scrap-lot-create-button"
                        onClick={createLot}
                    >
                        <span>♻️</span>
                        Create Digital Lot
                    </button>

                </div>

                {message && (
                    <div className="scrap-lot-success">
                        {message}
                    </div>
                )}

            </div>

        </section>
    );
}

export default CreateScrapLot;