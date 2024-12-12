import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate từ react-router-dom

const PaymentModal = ({ showModal, onClose, userLevel, requiredLevel, formattedMoney }) => {
    const navigate = useNavigate(); 
    

    if (!showModal) return null;  // Nếu không hiển thị modal thì return null

    const handlePaymentRedirect = () => {
        // Điều hướng đến trang PaymentPage
        navigate('/payment');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
                <h2>Thông tin thanh toán</h2>
                <p>
                    Bạn đang ở cấp độ {userLevel}, cần {formattedMoney} để nâng cấp lên {requiredLevel}.
                </p>
                <button onClick={handlePaymentRedirect}>Nạp tiền</button>  
            </div>
        </div>
    );
};

export default PaymentModal;
