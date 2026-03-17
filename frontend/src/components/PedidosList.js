import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, Modal, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
    FaShoppingCart, FaUser, FaBox, FaCalendar, 
    FaDollarSign, FaTruck, FaCheck, FaTimes, 
    FaEye, FaEdit, FaTrash, FaPlus, FaSearch,
    FaMapMarkerAlt, FaClock, FaPackage, FaCreditCard
} from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const PedidosList = () => {
    const [pedidos, setPedidos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    
    const [pedidoActual, setPedidoActual] = useState({
        cliente: '',
        productos: [],
        estado: 'pendiente',
        direccionEnvio: {
            calle: '',
            ciudad: '',
            codigoPostal: '',
            pais: 'España'
        }
    });

    const [productoSeleccionado, setProductoSeleccionado] = useState({
        producto: '',
        cantidad: 1
    });

    const estados = [
        { valor: 'pendiente', label: 'Pendiente', color: 'warning' },
        { valor: 'procesando', label: 'Procesando', color: 'info' },
        { valor: 'enviado', label: 'Enviado', color: 'primary' },
        { valor: 'entregado', label: 'Entregado', color: 'success' },
        { valor: 'cancelado', label: 'Cancelado', color: 'danger' }
    ];

    useEffect(() => {
        fetchPedidos();
        fetchClientes();
        fetchProductos();
    }, []);

    const fetchPedidos = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/pedidos`);
            const pedidosData = response.data.data || response.data;
            
            // Debug: Ver la estructura de los datos
            console.log('📦 Pedidos recibidos:', pedidosData);
            if (pedidosData.length > 0) {
                console.log('🔍 Estructura del primer pedido:', {
                    id: pedidosData[0]._id,
                    cliente: pedidosData[0].cliente,
                    tipoCliente: typeof pedidosData[0].cliente,
                    esObjeto: typeof pedidosData[0].cliente === 'object',
                    tieneNombre: pedidosData[0].cliente?.nombre
                });
            }
            
            setPedidos(pedidosData);
            setError(null);
        } catch (err) {
            console.error('Error al cargar pedidos:', err);
            setError('Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await axios.get(`${API_URL}/clientes`);
            setClientes(response.data.data || response.data);
        } catch (err) {
            console.error('Error al cargar clientes:', err);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await axios.get(`${API_URL}/productos`);
            setProductos(response.data.data || response.data);
        } catch (err) {
            console.error('Error al cargar productos:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);

            if (!pedidoActual.cliente) {
                setError('Debe seleccionar un cliente');
                return;
            }

            if (pedidoActual.productos.length === 0) {
                setError('Debe agregar al menos un producto');
                return;
            }

            const total = pedidoActual.productos.reduce((sum, item) => {
                return sum + (item.precioUnitario * item.cantidad);
            }, 0);

            const pedidoData = {
                cliente: pedidoActual.cliente, // Esto es un ID
                productos: pedidoActual.productos.map(item => ({
                    producto: item.producto, // Esto es un ID
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario
                })),
                estado: pedidoActual.estado,
                direccionEnvio: pedidoActual.direccionEnvio,
                total,
                fechaPedido: new Date()
            };

            console.log('📤 Enviando pedido:', pedidoData);

            if (pedidoActual._id) {
                await axios.put(`${API_URL}/pedidos/${pedidoActual._id}`, pedidoData);
                setSuccess('Pedido actualizado correctamente');
            } else {
                await axios.post(`${API_URL}/pedidos`, pedidoData);
                setSuccess('Pedido creado correctamente');
            }
            
            setShowModal(false);
            fetchPedidos();
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
        if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
            try {
                await axios.delete(`${API_URL}/pedidos/${id}`);
                fetchPedidos();
                setSuccess('Pedido eliminado correctamente');
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError('Error al eliminar pedido');
            }
        }
    };

    const handleUpdateEstado = async (id, nuevoEstado) => {
        try {
            await axios.patch(`${API_URL}/pedidos/${id}/estado`, { estado: nuevoEstado });
            fetchPedidos();
            setSuccess(`Pedido ${nuevoEstado} correctamente`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error al actualizar estado');
        }
    };

    const agregarProducto = () => {
        if (!productoSeleccionado.producto) {
            setError('Seleccione un producto');
            return;
        }

        if (productoSeleccionado.cantidad < 1) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        const producto = productos.find(p => p._id === productoSeleccionado.producto);
        
        if (!producto) {
            setError('Producto no encontrado');
            return;
        }

        if (producto.stock < productoSeleccionado.cantidad) {
            setError(`Stock insuficiente. Disponible: ${producto.stock}`);
            return;
        }

        const nuevoProducto = {
            producto: producto._id, // Guardamos SOLO el ID
            cantidad: parseInt(productoSeleccionado.cantidad),
            precioUnitario: producto.precio
            // No guardamos el nombre aquí
        };

        setPedidoActual({
            ...pedidoActual,
            productos: [...pedidoActual.productos, nuevoProducto]
        });

        setProductoSeleccionado({ producto: '', cantidad: 1 });
        setError(null);
    };

    const eliminarProducto = (index) => {
        const nuevosProductos = pedidoActual.productos.filter((_, i) => i !== index);
        setPedidoActual({ ...pedidoActual, productos: nuevosProductos });
    };

    const verPedido = (pedido) => {
        setPedidoSeleccionado(pedido);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setPedidoActual({
            cliente: '',
            productos: [],
            estado: 'pendiente',
            direccionEnvio: {
                calle: '',
                ciudad: '',
                codigoPostal: '',
                pais: 'España'
            }
        });
        setProductoSeleccionado({ producto: '', cantidad: 1 });
    };

    const getTotalPedido = (productos) => {
        return productos.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    };

    // Función de filtrado mejorada
    const pedidosFiltrados = pedidos.filter(pedido => {
        // Obtener nombre del cliente (ya sea como objeto o como ID)
        let nombreCliente = '';
        
        if (pedido.cliente?.nombre) {
            // Si cliente es un objeto poblado
            nombreCliente = pedido.cliente.nombre.toLowerCase();
        } else {
            // Si cliente es un ID, buscarlo en la lista
            const cliente = clientes.find(c => c._id === pedido.cliente);
            nombreCliente = cliente ? cliente.nombre.toLowerCase() : '';
        }
        
        const cumpleBusqueda = nombreCliente.includes(busqueda.toLowerCase()) ||
                              pedido._id.toLowerCase().includes(busqueda.toLowerCase());
        const cumpleFiltro = filtroEstado === 'todos' || pedido.estado === filtroEstado;
        return cumpleBusqueda && cumpleFiltro;
    });

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
        <div className="pedidos-list">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="modern-card">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="mb-1">Gestión de Pedidos</h2>
                                <p className="text-muted">Administra todos los pedidos de la tienda</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-moderno"
                                onClick={() => setShowModal(true)}
                            >
                                <FaPlus className="me-2" /> Nuevo Pedido
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

                        <Row className="mb-4">
                            <Col md={5}>
                                <div className="search-bar">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por cliente o ID..." 
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                    <FaSearch className="text-muted" />
                                </div>
                            </Col>
                            <Col md={4}>
                                <Form.Select 
                                    value={filtroEstado} 
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="todos">Todos los estados</option>
                                    {estados.map(estado => (
                                        <option key={estado.valor} value={estado.valor}>
                                            {estado.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3} className="text-end">
                                <Badge bg="info" className="p-2">
                                    Total: {pedidosFiltrados.length} pedidos
                                </Badge>
                            </Col>
                        </Row>

                        <div className="table-responsive">
                            <table className="table table-moderno">
                                <thead>
                                    <tr>
                                        <th>ID Pedido</th>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Productos</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosFiltrados.length > 0 ? (
                                        pedidosFiltrados.map((pedido) => {
                                            const estado = estados.find(e => e.valor === pedido.estado) || estados[0];
                                            
                                            return (
                                                <motion.tr
                                                    key={pedido._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    whileHover={{ scale: 1.01, backgroundColor: '#f8f9fa' }}
                                                >
                                                    <td>
                                                        <strong>#{pedido._id.slice(-6)}</strong>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                                                                <FaUser className="text-primary" size={12} />
                                                            </div>
                                                            {/* VERSIÓN CORREGIDA: Maneja tanto objeto poblado como ID */}
                                                            {pedido.cliente?.nombre || 
                                                             (clientes.find(c => c._id === pedido.cliente)?.nombre) || 
                                                             'Cliente no encontrado'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <FaCalendar className="text-muted me-2" />
                                                            {new Date(pedido.fechaPedido).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary" pill>
                                                            {pedido.productos.length} productos
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <strong>${pedido.total?.toFixed(2)}</strong>
                                                    </td>
                                                    <td>
                                                        <Badge bg={estado.color} pill className="px-3 py-2">
                                                            {estado.label}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="btn btn-sm btn-info text-white"
                                                                onClick={() => verPedido(pedido)}
                                                                title="Ver detalles"
                                                            >
                                                                <FaEye />
                                                            </motion.button>
                                                            
                                                            <Form.Select 
                                                                size="sm"
                                                                value={pedido.estado}
                                                                onChange={(e) => handleUpdateEstado(pedido._id, e.target.value)}
                                                                style={{ width: '120px' }}
                                                            >
                                                                {estados.map(e => (
                                                                    <option key={e.valor} value={e.valor}>
                                                                        {e.label}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>

                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDelete(pedido._id)}
                                                                title="Eliminar"
                                                            >
                                                                <FaTrash />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                No hay pedidos registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Modal para crear/editar pedido */}
                <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg" centered>
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title>
                            {pedidoActual._id ? '✏️ Editar Pedido' : '➕ Nuevo Pedido'}
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Cliente *</Form.Label>
                                <Form.Select
                                    value={pedidoActual.cliente}
                                    onChange={(e) => setPedidoActual({...pedidoActual, cliente: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar cliente</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente._id} value={cliente._id}>
                                            {cliente.nombre} - {cliente.email}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <h5 className="mt-4 mb-3">Productos</h5>
                            
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Select
                                        value={productoSeleccionado.producto}
                                        onChange={(e) => setProductoSeleccionado({...productoSeleccionado, producto: e.target.value})}
                                    >
                                        <option value="">Seleccionar producto</option>
                                        {productos.map(producto => (
                                            <option key={producto._id} value={producto._id}>
                                                {producto.nombre} - ${producto.precio} (Stock: {producto.stock})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={productoSeleccionado.cantidad}
                                        onChange={(e) => setProductoSeleccionado({...productoSeleccionado, cantidad: e.target.value})}
                                        placeholder="Cantidad"
                                    />
                                </Col>
                                <Col md={3}>
                                    <Button variant="success" onClick={agregarProducto}>
                                        <FaPlus /> Agregar
                                    </Button>
                                </Col>
                            </Row>

                            {pedidoActual.productos.length > 0 && (
                                <div className="table-responsive mb-3">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio Unit.</th>
                                                <th>Subtotal</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pedidoActual.productos.map((item, index) => {
                                                const producto = productos.find(p => p._id === item.producto);
                                                return (
                                                    <tr key={index}>
                                                        <td>{producto?.nombre || 'Producto no encontrado'}</td>
                                                        <td>{item.cantidad}</td>
                                                        <td>${item.precioUnitario}</td>
                                                        <td>${(item.cantidad * item.precioUnitario).toFixed(2)}</td>
                                                        <td>
                                                            <Button 
                                                                variant="danger" 
                                                                size="sm"
                                                                onClick={() => eliminarProducto(index)}
                                                            >
                                                                <FaTimes />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="table-active">
                                                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                                <td><strong>${getTotalPedido(pedidoActual.productos).toFixed(2)}</strong></td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <h5 className="mt-4 mb-3">Dirección de Envío</h5>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Calle</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={pedidoActual.direccionEnvio.calle}
                                    onChange={(e) => setPedidoActual({
                                        ...pedidoActual, 
                                        direccionEnvio: {...pedidoActual.direccionEnvio, calle: e.target.value}
                                    })}
                                    placeholder="Calle Principal 123"
                                />
                            </Form.Group>

                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ciudad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={pedidoActual.direccionEnvio.ciudad}
                                            onChange={(e) => setPedidoActual({
                                                ...pedidoActual, 
                                                direccionEnvio: {...pedidoActual.direccionEnvio, ciudad: e.target.value}
                                            })}
                                            placeholder="Madrid"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Código Postal</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={pedidoActual.direccionEnvio.codigoPostal}
                                            onChange={(e) => setPedidoActual({
                                                ...pedidoActual, 
                                                direccionEnvio: {...pedidoActual.direccionEnvio, codigoPostal: e.target.value}
                                            })}
                                            placeholder="28001"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>País</Form.Label>
                                        <Form.Select
                                            value={pedidoActual.direccionEnvio.pais}
                                            onChange={(e) => setPedidoActual({
                                                ...pedidoActual, 
                                                direccionEnvio: {...pedidoActual.direccionEnvio, pais: e.target.value}
                                            })}
                                        >
                                            <option>España</option>
                                            <option>México</option>
                                            <option>Argentina</option>
                                            <option>Colombia</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit">
                                {pedidoActual._id ? 'Actualizar' : 'Guardar'} Pedido
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Modal para ver detalles del pedido */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="bg-info text-white">
                        <Modal.Title>📋 Detalles del Pedido</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {pedidoSeleccionado && (
                            <div>
                                <div className="text-center mb-4">
                                    <div className="rounded-circle bg-info bg-opacity-10 p-4 d-inline-block">
                                        <FaShoppingCart size={40} className="text-info" />
                                    </div>
                                    <h3 className="mt-3">Pedido #{pedidoSeleccionado._id.slice(-6)}</h3>
                                    <Badge bg={estados.find(e => e.valor === pedidoSeleccionado.estado)?.color || 'secondary'} pill className="px-3 py-2">
                                        {estados.find(e => e.valor === pedidoSeleccionado.estado)?.label || pedidoSeleccionado.estado}
                                    </Badge>
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <h5>Información del Cliente</h5>
                                        <p>
                                            <FaUser className="me-2" /> 
                                            {pedidoSeleccionado.cliente?.nombre || 
                                             clientes.find(c => c._id === pedidoSeleccionado.cliente)?.nombre || 
                                             'N/A'}
                                        </p>
                                        <p><FaCalendar className="me-2" /> Fecha: {new Date(pedidoSeleccionado.fechaPedido).toLocaleString()}</p>
                                    </Col>
                                    <Col md={6}>
                                        <h5>Dirección de Envío</h5>
                                        <p><FaMapMarkerAlt className="me-2" /> {pedidoSeleccionado.direccionEnvio?.calle || 'N/A'}</p>
                                        <p className="ms-4">{pedidoSeleccionado.direccionEnvio?.ciudad}, {pedidoSeleccionado.direccionEnvio?.codigoPostal}</p>
                                        <p className="ms-4">{pedidoSeleccionado.direccionEnvio?.pais}</p>
                                    </Col>
                                </Row>

                                <h5 className="mt-4">Productos</h5>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio Unit.</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pedidoSeleccionado.productos?.map((item, index) => {
                                                // Buscar el producto tanto si viene poblado como si viene como ID
                                                const nombreProducto = item.producto?.nombre || 
                                                                      productos.find(p => p._id === item.producto)?.nombre || 
                                                                      'Producto no encontrado';
                                                
                                                return (
                                                    <tr key={index}>
                                                        <td>{nombreProducto}</td>
                                                        <td>{item.cantidad}</td>
                                                        <td>${item.precioUnitario}</td>
                                                        <td>${(item.cantidad * item.precioUnitario).toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="table-active">
                                                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                                <td><strong>${pedidoSeleccionado.total?.toFixed(2)}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
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

export default PedidosList;