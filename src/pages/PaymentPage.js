import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../assets/css/PaymentPage.css';

const PaymentPage = () => {
  const [amount, setAmount] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(null); 
  const [accessLevel, setAccessLevel] = useState(0);
  const [comic, setComic] = useState(null); 
  const [selectedComic, setSelectedComic] = useState(null); // Thêm state để lưu tên truyện đã chọn
  const navigate = useNavigate(); 

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AcQktlNy_KtFlVY5AN1vHIYIxON6dEUa31hnG-mTHgJrxd-Zn0MZ16vCkCPbFgj5uz-wYkzJGGtnxlwl&components=buttons";
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      console.log('PayPal SDK đã tải xong!');
    };
    script.onerror = () => {
      console.error('Lỗi khi tải PayPal SDK!');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/comics');
        const data = await response.json();
        setComic(data);  
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện:', error);
      }
    };
    
    fetchComic();
  }, []);  

  // Thêm hàm để chọn truyện
  const handleComicSelect = (comic) => {
    setSelectedComic(comic);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (amount % 10000 !== 0 || amount < 10000 || amount > 100000) {
      alert('Số tiền phải là bội số của 10000 và nằm trong khoảng từ 10.000 đến 100.000.');
      return;
    }

    alert(`Đang thanh toán ${amount} VND bằng PayPal`);
  };

  useEffect(() => {
    if (paypalLoaded && !paypalButtonRendered && amount > 0 && amount % 10000 === 0 && amount >= 10000 && amount <= 100000) {
      console.log('Đang render nút PayPal...');
      window.paypal.Buttons({
        createOrder: function(data, actions) {
          console.log('Đang tạo đơn hàng...');
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount > 0 ? amount : 0, 
              },
            }],
          });
        },
        onApprove: function(data, actions) {
          console.log('Đã duyệt thanh toán...');
          return actions.order.capture().then(function(details) {
            console.log('Thanh toán thành công!');
            setTransactionSuccess(amount); 
            const newAccessLevel = Math.floor(amount / 10000);
            setAccessLevel(newAccessLevel);

            alert('Thanh toán thành công! Chào mừng ' + details.payer.name.given_name);
          });
        },
        onError: function(err) {
          console.log('Lỗi trong quá trình thanh toán: ', err);
          alert('Có lỗi xảy ra trong quá trình thanh toán.');
        },
      }).render('#paypal-button'); 

      setPaypalButtonRendered(true); 
    }
  }, [paypalLoaded, amount, paypalButtonRendered, comic, navigate]);

  const handleAmountChange = (e) => {
    const newAmount = e.target.value;

    console.log("Số tiền nhập vào:", newAmount); 

    if (newAmount === '' || (newAmount % 10000 === 0 && newAmount >= 10000 && newAmount <= 100000)) {
      setAmount(newAmount);
    }
  };

  return (
    <div className="payment-page">
      <h2>Nạp Tiền</h2>

      {selectedComic && (
        <div className="selected-comic">
          <h3>Truyện đã chọn: {selectedComic.name}</h3>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Số tiền:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Nhập số tiền (bội số của 10000 từ 10.000 đến 100.000)"
            required
            min="10000" 
            max="100000" 
          />
        </div>

        <button type="submit" className="submit-btn">Nạp Tiền</button>
      </form>

      {paypalLoaded && amount >= 10000 && amount <= 100000 && amount % 10000 === 0 && (
        <div id="paypal-button-container">
          <div id="paypal-button"></div>
        </div>
      )}

      {transactionSuccess !== null && (
        <div className="transaction-success">
          <p>Thanh toán thành công! Số tiền đã thanh toán là: {transactionSuccess} VND</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
