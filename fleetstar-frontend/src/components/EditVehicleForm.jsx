import { useState } from "react";
import axios from "../api/axios";

export default function EditVehicleForm({ vehicle, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: vehicle.name,
        type: vehicle.type,
        dailyRate: vehicle.dailyRate,
        description: vehicle.description,
        numberPlate: vehicle.numberPlate,
        image: null,
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        if (e.target.name === "image") {
            setForm({ ...form, image: e.target.files[0] });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        for (const key in form) {
            if (form[key] !== null) {
                data.append(key, form[key]);
            }
        }

        try {
            await axios.put(`/vehicles/${vehicle._id}`, data);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update vehicle");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="text-lg mb-2">Edit Vehicle</h2>
            {error && <p className="text-red-500">{error}</p>}

            <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="block p-1 mb-2 w-full"
            />
            <input
                name="type"
                placeholder="Type"
                value={form.type}
                onChange={handleChange}
                required
                className="block p-1 mb-2 w-full"
            />
            <input
                name="dailyRate"
                placeholder="Daily Rate"
                type="number"
                value={form.dailyRate}
                onChange={handleChange}
                required
                className="block p-1 mb-2 w-full"
            />
            <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
                className="block p-1 mb-2 w-full"
            />
            <input
                name="numberPlate"
                placeholder="Number Plate"
                value={form.numberPlate}
                onChange={handleChange}
                required
                className="block p-1 mb-2 w-full"
            />
            <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="block p-1 mb-2 w-full"
            />

            <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 mr-2"
            >
                Save
            </button>
            <button
                type="button"
                onClick={onClose}
                className="bg-gray-400 text-white px-4 py-2"
            >
                Cancel
            </button>
        </form>
    );
}
