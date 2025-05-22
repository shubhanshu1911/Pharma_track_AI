import React, { useState } from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';

const ChatbotIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setChatHistory([...chatHistory, { user: 'You', text: userInput }]);
        try {
            setLoading(true);
            const response = await axios.post('http://3.111.31.228:5000/api/v1/LLMquery', { prompt: userInput });
            const botResponse = response.data.naturalLanguageResponse || 'Sorry, I could not process that.';
            setChatHistory((prev) => [...prev, { user: 'Bot', text: botResponse }]);
        } catch (error) {
            console.error('Error:', error);
            setChatHistory((prev) => [...prev, { user: 'Bot', text: 'An error occurred. Please try again later.' }]);
        } finally {
            setLoading(false);
            setUserInput('');
        }
    };

    return (
        <div>
            <div className="fixed bottom-5 right-5 z-50">
                <button
                    onClick={toggleChatbot}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition duration-300"
                >
                    <ChatIcon size={30} />
                </button>
            </div>
            {isOpen && (
                <div className="fixed bottom-16 right-5 z-50 bg-white rounded-lg shadow-lg w-80 h-96 border border-gray-300">
                    <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Pharma Assistant</h3>
                        <button
                            onClick={toggleChatbot}
                            className="text-white hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-full">
                        <p>Ask me anthing?</p>
                        <div className="mb-4">
                            {chatHistory.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-3 p-2 rounded-xl ${message.user === 'You'
                                            ? 'bg-blue-100 text-right'
                                            : 'bg-gray-100 text-left'
                                        }`}
                                >
                                    <strong>{message.user}: </strong>
                                    <span>{message.text}</span>
                                </div>
                            ))}
                        </div>
                        {loading && <p>Bot is thinking...</p>}
                        <form onSubmit={handleSubmit} className="mt-4">
                            <input
                                type="text"
                                value={userInput}
                                onChange={handleInputChange}
                                placeholder="Type your message..."
                                className="border p-2 rounded w-full"
                            />
                            <button
                                type="submit"
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotIcon;
