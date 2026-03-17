import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, Modal, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaTruck, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ProveedoresList = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    
    const [proveedorActual, setProveedorActual] = useState({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        direccion: {
            calle: '',
            ciudad: '',
            codigoPostal: '',
            pais: 'España'
        },
        activo: true
    });

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/proveedores`);
            setProveedores(response.data.data || response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar proveedores:', err);
            setError('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            
            // Validar campos obligatorios
            if (!proveedorActual.nombre || !proveedorActual.email) {
                setError('Nombre y email son obligatorios');
                return;
            }

            console.log('Enviando proveedor:', proveedorActual);

            let response;
            if (proveedorActual._id) {
                response = await axios.put(`${API_URL}/proveedores/${proveedorActual._id}`, proveedorActual);
                setSuccess('Proveedor actualizado correctamente');
            } else {
                response = await axios.post(`${API_URL}/proveedores`, proveedorActual);
                setSuccess('Proveedor creado correctamente');
            }
            
            setShowModal(false);
            fetchProveedores();
            resetForm();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error al guardar:', err);
            if (err.response) {
                setError('Error del servidor: ' + (err.response.data.message || JSON.stringify(err.response.data)));
            } else if (err.request) {
                setError('No se pudo conectar con el servidor');
            } else {
                setError('Error: ' + err.message);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
            try {
                await axios.delete(`${API_URL}/proveedores/${id}`);
                fetchProveedores();
                setSuccess('Proveedor eliminado correctamente');
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError('Error al eliminar proveedor');
            }
        }
    };

    const verProveedor = (proveedor) => {
        setProveedorSeleccionado(proveedor);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setProveedorActual({
            nombre: '',
            email: '',
            telefono: '',
            empresa: '',
            direccion: {
                calle: '',
                ciudad: '',
                codigoPostal: '',
                pais: 'España'
            },
            activo: true
        });
    };

    // Filtrar proveedores
    const proveedoresFiltrados = proveedores.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </Container>
        );
    }

    return (
        <div className="proveedores-list">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="modern-card">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="mb-1">Gestión de Proveedores</h2>
                                <p className="text-muted">Administra todos tus proveedores</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-moderno"
                                onClick={() => setShowModal(true)}
                            >
                                <FaPlus className="me-2" /> Nuevo Proveedor
                            </motion.button>
                        </div>

                        {error && (
                            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                {error}
                            </Alert>
                        )}
                        
                        {success && (
                            <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                                {success}
                            </Alert>
                        )}

                        {/* Buscador */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <div className="search-bar">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar proveedores por nombre, empresa o email..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                    <button>🔍</button>
                                </div>
                            </Col>
                            <Col md={6} className="text-end">
                                <Badge bg="info" className="p-2">
                                    Total: {proveedoresFiltrados.length} proveedores
                                </Badge>
                            </Col>
                        </Row>

                        {/* Tabla de proveedores */}
                        <div className="table-responsive">
                            <table className="table table-moderno">
                                <thead>
                                    <tr>
                                        <th>Proveedor</th>
                                        <th>Empresa</th>
                                        <th>Contacto</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Ubicación</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proveedoresFiltrados.length > 0 ? (
                                        proveedoresFiltrados.map((proveedor) => (
                                            <motion.tr
                                                key={proveedor._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                whileHover={{ scale: 1.01, backgroundColor: '#f8f9fa' }}
                                            >
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                                            <FaTruck className="text-primary" />
                                                        </div>
                                                        <strong>{proveedor.nombre}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaBuilding className="text-muted me-2" />
                                                        {proveedor.empresa || 'N/A'}
                                                    </div>
                                                </td>
                                                <td>{proveedor.nombre}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaEnvelope className="text-muted me-2" />
                                                        {proveedor.email}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaPhone className="text-muted me-2" />
                                                        {proveedor.telefono || 'N/A'}
                                                    </div>
                                                </td>
                                                <td>
                                                    {proveedor.direccion ? (
                                                        <div className="d-flex align-items-center">
                                                            <FaMapMarkerAlt className="text-muted me-2" />
                                                            {proveedor.direccion.ciudad || 'N/A'}
                                                        </div>
                                                    ) : 'N/A'}
                                                </td>
                                                <td>
                                                    {proveedor.activo ? 
                                                        <Badge bg="success" pill>Activo</Badge> : 
                                                        <Badge bg="secondary" pill>Inactivo</Badge>
                                                    }
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="btn btn-sm btn-info text-white"
                                                            onClick={() => verProveedor(proveedor)}
                                                            title="Ver detalles"
                                                        >
                                                            <FaEye />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => {
                                                                setProveedorActual(proveedor);
                                                                setShowModal(true);
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <FaEdit />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(proveedor._id)}
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                No hay proveedores registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Modal para crear/editar proveedor */}
                <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg" centered>
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title>
                            {proveedorActual._id ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre del contacto *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={proveedorActual.nombre}
                                            onChange={(e) => setProveedorActual({...proveedorActual, nombre: e.target.value})}
                                            placeholder="Ej: Juan Pérez"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Empresa</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={proveedorActual.empresa}
                                            onChange={(e) => setProveedorActual({...proveedorActual, empresa: e.target.value})}
                                            placeholder="Ej: Tecnologías SA"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={proveedorActual.email}
                                            onChange={(e) => setProveedorActual({...proveedorActual, email: e.target.value})}
                                            placeholder="ejemplo@empresa.com"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={proveedorActual.telefono}
                                            onChange={(e) => setProveedorActual({...proveedorActual, telefono: e.target.value})}
                                            placeholder="+34 123 456 789"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h5 className="mt-3 mb-3">📍 Dirección</h5>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Calle</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={proveedorActual.direccion.calle}
                                            onChange={(e) => setProveedorActual({
                                                ...proveedorActual, 
                                                direccion: {...proveedorActual.direccion, calle: e.target.value}
                                            })}
                                            placeholder="Calle Principal 123"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ciudad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={proveedorActual.direccion.ciudad}
                                            onChange={(e) => setProveedorActual({
                                                ...proveedorActual, 
                                                direccion: {...proveedorActual.direccion, ciudad: e.target.value}
                                            })}
                                            placeholder="Madrid"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Código Postal</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={proveedorActual.direccion.codigoPostal}
                                            onChange={(e) => setProveedorActual({
                                                ...proveedorActual, 
                                                direccion: {...proveedorActual.direccion, codigoPostal: e.target.value}
                                            })}
                                            placeholder="28001"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>País</Form.Label>
                                        <Form.Select
                                            value={proveedorActual.direccion.pais}
                                            onChange={(e) => setProveedorActual({
                                                ...proveedorActual, 
                                                direccion: {...proveedorActual.direccion, pais: e.target.value}
                                            })}
                                        >
                                            <option>España</option>
                                            <option>México</option>
                                            <option>Argentina</option>
                                            <option>Colombia</option>
                                            <option>Chile</option>
                                            <option>Perú</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Proveedor activo"
                                    checked={proveedorActual.activo}
                                    onChange={(e) => setProveedorActual({...proveedorActual, activo: e.target.checked})}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" className="btn-moderno">
                                {proveedorActual._id ? 'Actualizar' : 'Guardar'} Proveedor
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Modal para ver detalles del proveedor */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                    <Modal.Header closeButton className="bg-info text-white">
                        <Modal.Title>📋 Detalles del Proveedor</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {proveedorSeleccionado && (
                            <div>
                                <div className="text-center mb-4">
                                    <div className="rounded-circle bg-info bg-opacity-10 p-4 d-inline-block">
                                        <FaTruck size={40} className="text-info" />
                                    </div>
                                    <h3 className="mt-3">{proveedorSeleccionado.nombre}</h3>
                                    <Badge bg={proveedorSeleccionado.activo ? 'success' : 'secondary'}>
                                        {proveedorSeleccionado.activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <p><strong>🏢 Empresa:</strong> {proveedorSeleccionado.empresa || 'N/A'}</p>
                                        <p><strong>📧 Email:</strong> {proveedorSeleccionado.email}</p>
                                        <p><strong>📞 Teléfono:</strong> {proveedorSeleccionado.telefono || 'N/A'}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>📍 Dirección:</strong></p>
                                        {proveedorSeleccionado.direccion ? (
                                            <>
                                                <p className="ms-3">{proveedorSeleccionado.direccion.calle}</p>
                                                <p className="ms-3">
                                                    {proveedorSeleccionado.direccion.ciudad}, 
                                                    {proveedorSeleccionado.direccion.codigoPostal}
                                                </p>
                                                <p className="ms-3">{proveedorSeleccionado.direccion.pais}</p>
                                            </>
                                        ) : (
                                            <p className="ms-3">No especificada</p>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </motion.div>
        </div>
    );
};

export default ProveedoresList;