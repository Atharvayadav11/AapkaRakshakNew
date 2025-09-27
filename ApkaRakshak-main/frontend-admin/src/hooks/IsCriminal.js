import { useState } from "react";

export const useIsCriminal = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchResponse = async (img) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/compare-faces', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ image1: img })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result = await response.json();
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { fetchResponse, error, loading };
};