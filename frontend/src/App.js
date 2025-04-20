import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Catalogue from './pages/Catalogue';
import OrderForm from './pages/OrderForm';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './pages/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light agro-navbar px-4 shadow-sm">
          <div className="container-fluid">
            <Link className="navbar-brand fs-3 fw-bold text-dark" to="/">🌱 AgroFix</Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link text-dark fw-medium" to="/">Catalogue</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-dark fw-medium" to="/order">Order</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-dark fw-medium" to="/track">Track</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-dark fw-medium" to="/admin">Admin</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container-fluid px-3 px-md-5 py-4">
          <Routes>
            <Route path="/" element={<Catalogue />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;