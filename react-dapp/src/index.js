import { BrowserRouter, Routes, Route } from 'react-router-dom';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
import contractsInfo from './contractsInfo.json';
import Hotel from './Pages/HotelPage';
import HotelAdminPage from './Pages/HotelAdminPage';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="*" element={<div>404 Not Found</div>} />
          {contractsInfo.hotels.map((hotel) => 
            { return <Route path={`/hotels/${hotel.contractAddress}`} element={<Hotel
                contractAddress={hotel.contractAddress}
             />} />}
          )}
          {contractsInfo.hotels.map((hotel) => 
            { return <Route path={`/hotels/admin/${hotel.contractAddress}`} element={<HotelAdminPage
                contractAddress={hotel.contractAddress}
             />} />}
          )}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
