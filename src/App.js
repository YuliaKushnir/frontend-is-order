import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Navbar from './shared/components/Navigation/Navbar';
import ProductsPage from './app/products/pages/ProductPage';
import { CartProvider } from './context/CartContext';
import ProductDetailsPage from './app/products/pages/ProductDetailsPage';
import ProductCreate from './app/products/pages/ProductCreate';
import OrdersPage from './app/orders/pages/OrdersPage';
import UserOrdersPage from './app/orders/pages/UserOrdersPage';
import StockPage from './app/products/pages/StockPage';
import StockAllPage from './app/products/pages/StockAllPage';
import CreateOrderPage from './app/orders/pages/CreateOrderPage';
import OrderViewPage from './app/orders/pages/OrderViewPage';
import OrderEditPage from './app/orders/pages/OrderEditPage';
import CartPage from './app/cart/pages/CartPage';
import AccountPage from './app/orders/pages/AccountPage';
import { useDispatch } from 'react-redux';
import { setCredentials } from './store/authSlice';
import { AuthContext } from 'react-oauth2-code-pkce';
import UsersPage from './app/users/pages/UsersPage';
// import Navbar from './shared/components/navigation/Navbar';

function App() {
  const { token, tokenData } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  
  useEffect(() => {
    if (token) {
      dispatch(setCredentials({token, user: tokenData}));
      setAuthReady(true);
    }
  }, [token, tokenData, dispatch]);

  return (
    <CartProvider>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<ProductsPage/>} />
          <Route path="/products" element={<ProductsPage/>} />
          <Route path="/products/new" element={<ProductCreate/>} />
          <Route path="/products/edit/:id" element={<ProductCreate />} />
          <Route path="/products/:id" element={<ProductDetailsPage/>} />

          <Route path="/orders" element={<OrdersPage/>}/>
          <Route path="/orders/new" element={<CreateOrderPage />} />
          <Route path="/orders/:id" element={<OrderViewPage/>} />
          <Route path="/orders/:id/edit" element={<OrderEditPage/>} />

          <Route path="/users" element={<UsersPage/>} />
          <Route path="/users/:userId/orders" element={<UserOrdersPage/>} />

          <Route path="/stock" element={<StockPage />} />
          <Route path="/stock/all" element={<StockAllPage />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/account/:userId" element={<AccountPage />} />

          {/* <Route path="/about" element={<h1>Про нас</h1>} /> */}

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
