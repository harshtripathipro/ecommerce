import React from "react";
import Header from "../Header";
import "./index.css";
import { Link } from "react-router-dom";

const App = () => {
  return (
    <div className='app'>
      <Header />
      <div className='app-container'>
        <div className='image'></div>
        <div className='app-container2'>
          <div className='app-title'>New Fall-Summer</div>
          <div className='app-title'>Collection</div>
          <div className='app-subtitle'>Shop the latest Fashion</div>
          <Link to={`/products`} style={{ textDecoration: "none" }}>
            <button className='app-button'>Shop Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;
