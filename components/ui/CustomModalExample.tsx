import { useState } from "react";

export default function CustomModalExample() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <button
                className="py-2 px-4 bg-gray-800 text-white"
                onClick={() => setIsModalOpen(true)}
            >
                Open Modal
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg">
                        <h2>Complete Your Profile</h2>
                        <button
                            className="mt-4 py-2 px-4 bg-gray-800 text-white"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
