import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NoPage from "./pages/NoPage";
import Layout from "./pages/Layout";
import LandingPage from "./pages/LandingPage";
import AddCustomer from './pages/AddCustomer';
import UpdateCustomer from './pages/UpdateCustomer';
import GetCustomer from './pages/GetCustomer';
import Profile from "./pages/Profile";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<Signup />} />
            <Route path='profile' element={<Profile />} />
            <Route path='home' element={<HomePage />} />
            <Route path='*' element={<NoPage />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/update-customer/:policyNumber" element={<UpdateCustomer />} />
            <Route path="/get-customer" element={<GetCustomer />} />


          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
