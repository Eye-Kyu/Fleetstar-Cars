import { useState } from "react";
import axios from "../api/axios";

export default function VehicleForm({ onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        type: "",
        dailyRate: "",
        description: "",
        numberPlate: "",
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
            data.append(key, form[key]);
        }

        try {
            await axios.post("/vehicles", data);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create vehicle");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="text-lg mb-2">Add New Vehicle</h2>
            {error && <p className="text-red-500">{error}</p>}

            <input name="name" placeholder="Name" onChange={handleChange} required className="block p-1 mb-2 w-full" />
            <input name="type" placeholder="Type" onChange={handleChange} required className="block p-1 mb-2 w-full" />
            <input name="dailyRate" placeholder="Daily Rate" type="number" onChange={handleChange} required className="block p-1 mb-2 w-full" />
            <input name="description" placeholder="Description" onChange={handleChange} required className="block p-1 mb-2 w-full" />
            <input name="numberPlate" placeholder="Number Plate" onChange={handleChange} required className="block p-1 mb-2 w-full" />
            <input name="image" type="file" accept="image/*" onChange={handleChange} className="block p-1 mb-2 w-full" />

            <button type="submit" className="bg-blue-500 text-white px-4 py-2">Save</button>
        </form>
    );
}
