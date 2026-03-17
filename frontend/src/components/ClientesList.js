import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { clientesAPI } from '../services/api';

const ClientesList = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [clienteActual, setClienteActual] = useState({
        nombre: '',
        email: '',
        telefono: '',
        fechaNacimiento: '', // Nuevo campo
        direccion: { calle: '', ciudad: '', codigoPostal: '', pais: '' }
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await clientesAPI.getAll();
            setClientes(response.data.data || response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar clientes');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validar que la fecha de nacimiento no sea futura
            const fechaNacimiento = new Date(clienteActual.fechaNacimiento);
            if (fechaNacimiento > new Date()) {
                setError('La fecha de nacimiento no puede ser futura');
                return;
            }

            if (clienteActual._id) {
                await clientesAPI.update(clienteActual._id, clienteActual);
            } else {
                await clientesAPI.create(clienteActual);
            }
            setShowModal(false);
            fetchClientes();
            resetForm();
            setError(null);
        } catch (err) {
            setError('Error al guardar cliente');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await clientesAPI.delete(id);
                fetchClientes();
            } catch (err) {
                setError('Error al eliminar cliente');
            }
        }
    };

    const resetForm = () => {
        setClienteActual({
            nombre: '',
            email: '',
            telefono: '',
            fechaNacimiento: '', // Resetear fecha de nacimiento
            direccion: { calle: '', ciudad: '', codigoPostal: '', pais: '' }
        });
    };

    // Función para formatear la fecha para el input type="date"
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Función para calcular la edad (si el backend no la envía)
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    if (loading) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <Container className="mt-4">
            <h2>Gestión de Clientes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Button variant="primary" onClick={() => {
                resetForm();
                setShowModal(true);
            }} className="mb-3">
                Nuevo Cliente
            </Button>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Edad</th> {/* Nueva columna */}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map(cliente => (
                        <tr key={cliente._id}>
                            <td>{cliente.nombre}</td>
                            <td>{cliente.email}</td>
                            <td>{cliente.telefono || 'N/A'}</td>
                            <td>
                                {/* Si el backend envía la edad calculada */}
                                {cliente.edad ? `${cliente.edad} años` : 
                                 // Si no, calcular localmente
                                 cliente.fechaNacimiento ? `${calcularEdad(cliente.fechaNacimiento)} años` : 'N/A'}
                            </td>
                            <td>
                                <Button 
                                    variant="warning" 
                                    size="sm" 
                                    onClick={() => {
                                        setClienteActual({
                                            ...cliente,
                                            fechaNacimiento: formatDateForInput(cliente.fechaNacimiento)
                                        });
                                        setShowModal(true);
                                    }}
                                    className="me-2"
                                >
                                    Editar
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleDelete(cliente._id)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => {
                setShowModal(false);
                setError(null);
                resetForm();
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{clienteActual._id ? 'Editar' : 'Nuevo'} Cliente</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={clienteActual.nombre} 
                                        onChange={(e) => setClienteActual({...clienteActual, nombre: e.target.value})} 
                                        required 
                                        placeholder="Ingrese el nombre completo"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={clienteActual.email} 
                                        onChange={(e) => setClienteActual({...clienteActual, email: e.target.value})} 
                                        required 
                                        placeholder="ejemplo@correo.com"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control 
                                        type="tel"
                                        value={clienteActual.telefono} 
                                        onChange={(e) => setClienteActual({...clienteActual, telefono: e.target.value})} 
                                        placeholder="Ingrese el teléfono"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={clienteActual.fechaNacimiento || ''} 
                                        onChange={(e) => setClienteActual({...clienteActual, fechaNacimiento: e.target.value})} 
                                        required 
                                        max={new Date().toISOString().split('T')[0]} // No permite fechas futuras
                                    />
                                    <Form.Text className="text-muted">
                                        {clienteActual.fechaNacimiento && `Edad calculada: ${calcularEdad(clienteActual.fechaNacimiento)} años`}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <h5 className="mt-3">Dirección</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Calle</Form.Label>
                                    <Form.Control 
                                        value={clienteActual.direccion?.calle || ''} 
                                        onChange={(e) => setClienteActual({
                                            ...clienteActual, 
                                            direccion: {...clienteActual.direccion, calle: e.target.value}
                                        })} 
                                        placeholder="Calle y número"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ciudad</Form.Label>
                                    <Form.Control 
                                        value={clienteActual.direccion?.ciudad || ''} 
                                        onChange={(e) => setClienteActual({
                                            ...clienteActual, 
                                            direccion: {...clienteActual.direccion, ciudad: e.target.value}
                                        })} 
                                        placeholder="Ciudad"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Código Postal</Form.Label>
                                    <Form.Control 
                                        value={clienteActual.direccion?.codigoPostal || ''} 
                                        onChange={(e) => setClienteActual({
                                            ...clienteActual, 
                                            direccion: {...clienteActual.direccion, codigoPostal: e.target.value}
                                        })} 
                                        placeholder="Código postal"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>País</Form.Label>
                                    <Form.Control 
                                        value={clienteActual.direccion?.pais || ''} 
                                        onChange={(e) => setClienteActual({
                                            ...clienteActual, 
                                            direccion: {...clienteActual.direccion, pais: e.target.value}
                                        })} 
                                        placeholder="País"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowModal(false);
                            resetForm();
                            setError(null);
                        }}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {clienteActual._id ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ClientesList;