import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { productosAPI, proveedoresAPI } from '../services/api';

const ProductosList = () => {
    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    
    const [productoActual, setProductoActual] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        proveedor: '',
        activo: true
    });

    const categorias = ['Electrónica', 'Alimentación', 'Ropa', 'Hogar', 'Deportes', 'Otros'];

    useEffect(() => {
        fetchProductos();
        fetchProveedores();
    }, []);

    const fetchProductos = async () => {
        try {
            const response = await productosAPI.getAll();
            setProductos(response.data.data || response.data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchProveedores = async () => {
        try {
            const response = await proveedoresAPI.getAll();
            setProveedores(response.data.data || response.data);
        } catch (err) {
            console.error('Error al cargar proveedores:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productoData = {
                ...productoActual,
                precio: parseFloat(productoActual.precio),
                stock: parseInt(productoActual.stock)
            };

            if (productoActual._id) {
                await productosAPI.update(productoActual._id, productoData);
                setSuccess('Producto actualizado');
            } else {
                await productosAPI.create(productoData);
                setSuccess('Producto creado');
            }
            
            setShowModal(false);
            fetchProductos();
            resetForm();
        } catch (err) {
            setError('Error al guardar producto');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await productosAPI.delete(id);
                fetchProductos();
                setSuccess('Producto eliminado');
            } catch (err) {
                setError('Error al eliminar');
            }
        }
    };

    const resetForm = () => {
        setProductoActual({
            nombre: '', descripcion: '', precio: '', stock: '', categoria: '', proveedor: '', activo: true
        });
    };

    const getStockBadge = (stock) => {
        if (stock <= 0) return <Badge bg="danger">Agotado</Badge>;
        if (stock < 10) return <Badge bg="warning">Bajo stock</Badge>;
        return <Badge bg="success">Disponible</Badge>;
    };

    const productosFiltrados = productos.filter(p => 
        (categoriaFiltro === 'todas' || p.categoria === categoriaFiltro) &&
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <Container className="mt-4">
            <h2>Gestión de Productos</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar productos..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                        <option value="todas">Todas las categorías</option>
                        {categorias.map(cat => <option key={cat}>{cat}</option>)}
                    </Form.Select>
                </Col>
                <Col md={4} className="text-end">
                    <Button variant="primary" onClick={() => setShowModal(true)}>Nuevo Producto</Button>
                </Col>
            </Row>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Proveedor</th><th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productosFiltrados.map(p => (
                        <tr key={p._id}>
                            <td>{p.nombre}</td>
                            <td>{p.categoria}</td>
                            <td>${p.precio}</td>
                            <td>{getStockBadge(p.stock)} {p.stock}</td>
                            <td>{p.proveedor?.nombre || 'Sin proveedor'}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => { setProductoActual(p); setShowModal(true); }}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{productoActual._id ? 'Editar' : 'Nuevo'} Producto</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control value={productoActual.nombre} onChange={(e) => setProductoActual({...productoActual, nombre: e.target.value})} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control as="textarea" value={productoActual.descripcion} onChange={(e) => setProductoActual({...productoActual, descripcion: e.target.value})} />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Precio</Form.Label>
                                    <Form.Control type="number" step="0.01" value={productoActual.precio} onChange={(e) => setProductoActual({...productoActual, precio: e.target.value})} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control type="number" value={productoActual.stock} onChange={(e) => setProductoActual({...productoActual, stock: e.target.value})} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Categoría</Form.Label>
                            <Form.Select value={productoActual.categoria} onChange={(e) => setProductoActual({...productoActual, categoria: e.target.value})} required>
                                <option value="">Seleccionar</option>
                                {categorias.map(cat => <option key={cat}>{cat}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Select value={productoActual.proveedor} onChange={(e) => setProductoActual({...productoActual, proveedor: e.target.value})}>
                                <option value="">Sin proveedor</option>
                                {proveedores.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ProductosList;