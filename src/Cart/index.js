import React from "react";
import Header from "../Header";
import { Link } from "react-router-dom";
import "./index.css";

const Cart = ({ item, setItem }) => {
  function isDate(val) {
    // Cross realm comptatible
    return Object.prototype.toString.call(val) === "[object Date]";
  }

  function isObj(val) {
    return typeof val === "object";
  }

  function stringifyValue(val) {
    if (isObj(val) && !isDate(val)) {
      return JSON.stringify(val);
    } else {
      return val;
    }
  }

  function buildForm({ action, params }) {
    const form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", action);

    Object.keys(params).forEach((key) => {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", stringifyValue(params[key]));
      form.appendChild(input);
    });

    return form;
  }

  function post(details) {
    const form = buildForm(details);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  const getData = (data) => {
    return fetch(`http://localhost:5000/api/payment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => console.log("hello", response))
      .catch((err) => console.log("hello", err));
  };
  const handleClick = () => {
    console.log(item.totalMoney);
    getData({
      amount: item.totalMoney,
      email: "tripathiharsh1991@gmail.com",
    }).then((response) => {
      console.log("hello", response);
      // var information = {
      //   action: `https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${response.MID}&orderId=${response.ORDER_ID}`,
      //   params: response,
      // };

      // post(information);
    });
  };
  return (
    <div className='cart'>
      <Header />
      <div className='cart-container'>
        <div className='cart-title'>Shopping Cart</div>
        <div className='order-container'>
          <div className='order-title'>Order Summary</div>
          <div className='items'>
            <div>ITEMS</div>
            <div>{item.totalItems}</div>
          </div>
          <div className='cost'>
            <div>TOTAL COST</div>
            <div>Rs. {item.totalMoney}</div>
          </div>
          <button className='cart-button' onClick={handleClick}>
            CHECKOUT
          </button>
          <Link to={"/products"} className='reverse'>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
