import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaTimes, FaUser } from "react-icons/fa";

import "../assets/css/chatbot.css";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng chatbot

    const toggleChatbot = () => setIsOpen(!isOpen);

    // Khi chatbot mở ra, gửi tin nhắn chào hỏi
    useEffect(() => {
        if (isOpen) {
            const greetMessage = { sender: "bot", text: "Xin chào! Tôi có thể giúp gì được cho bạn?" };
            setMessages((prevMessages) => [...prevMessages, greetMessage]);
        }
    }, [isOpen]); // useEffect sẽ chạy khi `isOpen` thay đổi

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Lưu tin nhắn của người dùng vào state và reset input
        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");

        console.log("User's message: ", input); // In tin nhắn của người dùng ra console

        try {
            // Gửi yêu cầu POST bằng axios
            const response = await axios.post("http://localhost:5000/api/chatbot", {
                message: input,
            });

            console.log("Bot's response: ", response.data.response); // In phản hồi của bot ra console

            // Cập nhật tin nhắn từ chatbot vào state
            setMessages([...newMessages, { sender: "bot", text: response.data.response }]);

        } catch (error) {
            console.error("Error:", error); // In lỗi nếu có
            // Nếu có lỗi, thêm thông báo lỗi vào tin nhắn
            setMessages([...newMessages, { sender: "bot", text: "Lỗi khi kết nối với chatbot." }]);
        }
    };

    return (
        <>
            {/* Nút bật chatbot */}
            {!isOpen && (
                <button
                    className="chatbot-toggle-btn"
                    onClick={toggleChatbot}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        background: "#007bff", // Màu nền nút
                        color: "white", // Màu chữ
                        border: "none", // Không có viền
                        borderRadius: "50%", // Bo tròn
                        width: "70px", // Chiều rộng nút
                        height: "70px", // Chiều cao nút
                        display: "flex", // Sử dụng Flexbox
                        alignItems: "center", // Căn giữa theo chiều dọc
                        justifyContent: "center", // Căn giữa theo chiều ngang
                        cursor: "pointer", // Con trỏ chuột khi di chuột vào
                        zIndex: 9999, // Đảm bảo nút luôn ở trên
                    }}
                >
                    <FaRobot size={40} />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header" onClick={toggleChatbot}>
                        <FaRobot size={30} style={{ marginRight: "10px" }} />
                        Hỗ trợ trực tuyến
                        <FaTimes size={30} style={{ marginLeft: "auto", cursor: "pointer" }} />
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
                            >
                                <div className="chatbot-message-avatar">
                                    {msg.sender === "user" ? (
                                        <div className="chatbot-message-avatar user-avatar">
                                            <FaUser size={30} />
                                        </div>
                                    ) : (
                                        <div className="chatbot-message-avatar admin-avatar">
                                            <FaRobot size={30} />
                                        </div>
                                    )}
                                </div>
                                <div className="chatbot-message-text">{msg.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button
                            onClick={handleSendMessage}
                            style={{
                                backgroundColor: "#007bff", // Màu nền giống với nút bật chatbot
                                color: "white", // Màu chữ
                                border: "none", // Không có viền
                                borderRadius: "5px", // Bo tròn góc
                                padding: "10px 15px", // Kích thước padding
                                cursor: "pointer", // Hiển thị con trỏ chuột khi di chuột vào
                                display: "flex", // Sử dụng Flexbox để căn giữa icon
                                alignItems: "center", // Căn giữa theo chiều dọc
                                justifyContent: "center", // Căn giữa theo chiều ngang
                            }}
                        >
                            <FaPaperPlane
                                size={16}
                                style={{
                                    marginRight: "5px", // Đẩy icon sang trái
                                }}
                            />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
