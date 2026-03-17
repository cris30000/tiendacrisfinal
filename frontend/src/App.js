import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaHome, FaUsers, FaBox, FaTruck, FaShoppingCart, 
    FaChartBar, FaCog, FaBell 
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ClientesList from './components/ClientesList';
import ProductosList from './components/ProductosList';
import ProveedoresList from './components/ProveedoresList';
import PedidosList from './components/PedidosList';
import Dashboard from './components/Dashboard';

function App() {
    const location = useLocation();

    return (
        <div className="app-moderno">
            {/* Barra superior */}
            <div className="top-bar">
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="logo-area"
                            >
                                <span className="logo-icon">🛍️</span>
                                <span className="logo-text">Tienda<span className="highlight">Cris</span></span>
                            </motion.div>
                            <div className="search-bar">
                                <input type="text" placeholder="Buscar productos, clientes..." />
                                <button>🔍</button>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <motion.div whileHover={{ scale: 1.1 }} className="notification-icon">
                                <FaBell />
                                <Badge bg="danger" pill className="notification-badge">3</Badge>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} className="user-profile">
                                <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8F81&color=fff" alt="User" />
                                <span>Admin</span>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </div>

            <div className="main-layout">
                {/* Sidebar */}
                <motion.div 
                    className="sidebar"
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <Nav className="flex-column">
                        <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>
                            <FaChartBar /> <span>Dashboard</span>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/clientes" className={location.pathname === '/clientes' ? 'active' : ''}>
                            <FaUsers /> <span>Clientes</span>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/productos" className={location.pathname === '/productos' ? 'active' : ''}>
                            <FaBox /> <span>Productos</span>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/proveedores" className={location.pathname === '/proveedores' ? 'active' : ''}>
                            <FaTruck /> <span>Proveedores</span>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/pedidos" className={location.pathname === '/pedidos' ? 'active' : ''}>
                            <FaShoppingCart /> <span>Pedidos</span>
                        </Nav.Link>
                        <div className="sidebar-divider"></div>
                        <Nav.Link as={Link} to="/configuracion">
                            <FaCog /> <span>Configuración</span>
                        </Nav.Link>
                    </Nav>
                </motion.div>

                {/* Contenido principal */}
                <motion.div 
                    className="main-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Container fluid>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Routes location={location}>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/clientes" element={<ClientesList />} />
                                    <Route path="/productos" element={<ProductosList />} />
                                    <Route path="/proveedores" element={<ProveedoresList />} />
                                    <Route path="/pedidos" element={<PedidosList />} />
                                </Routes>
                            </motion.div>
                        </AnimatePresence>
                    </Container>
                </motion.div>
            </div>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}