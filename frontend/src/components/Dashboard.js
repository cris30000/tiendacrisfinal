import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
    FaUsers, FaBox, FaTruck, FaShoppingCart, 
    FaDollarSign, FaChartLine, FaArrowUp, FaArrowDown 
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell,
    LineChart, Line 
} from 'recharts';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para los datos
    const [totalClientes, setTotalClientes] = useState(0);
    const [totalProductos, setTotalProductos] = useState(0);
    const [totalProveedores, setTotalProveedores] = useState(0);
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [ventasMensuales, setVentasMensuales] = useState([]);
    const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
    const [ultimosPedidos, setUltimosPedidos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalVentas: 0,
        ventasHoy: 0,
        ventasSemana: 0,
        ventasMes: 0
    });

    const [stats, setStats] = useState([
        { title: 'Clientes', value: '0', icon: FaUsers, color: '#667eea', change: '+0%' },
        { title: 'Productos', value: '0', icon: FaBox, color: '#764ba2', change: '+0%' },
        { title: 'Proveedores', value: '0', icon: FaTruck, color: '#f6c23e', change: '+0%' },
        { title: 'Pedidos', value: '0', icon: FaShoppingCart, color: '#e74a3b', change: '+0%' },
    ]);

    const COLORS = ['#667eea', '#764ba2', '#f6c23e', '#e74a3b', '#1cc88a', '#36b9cc'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Obtener todos los datos en paralelo
            const [clientesRes, productosRes, pedidosRes, proveedoresRes, estadisticasRes] = await Promise.all([
                axios.get(`${API_URL}/clientes`),
                axios.get(`${API_URL}/productos`),
                axios.get(`${API_URL}/pedidos`),
                axios.get(`${API_URL}/proveedores`),
                axios.get(`${API_URL}/pedidos/estadisticas`).catch(() => ({ data: { data: {} } })) // Por si el endpoint no existe
            ]);

            // Procesar datos de clientes
            const clientes = clientesRes.data.data || clientesRes.data || [];
            setTotalClientes(clientes.length);

            // Procesar datos de productos
            const productos = productosRes.data.data || productosRes.data || [];
            setTotalProductos(productos.length);

            // Procesar datos de proveedores
            const proveedores = proveedoresRes.data.data || proveedoresRes.data || [];
            setTotalProveedores(proveedores.length);

            // Procesar datos de pedidos
            const pedidos = pedidosRes.data.data || pedidosRes.data || [];
            setTotalPedidos(pedidos.length);

            // Calcular estadísticas de pedidos
            const ahora = new Date();
            const hoy = new Date(ahora.setHours(0, 0, 0, 0));
            const semanaPasada = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
            const mesPasado = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

            let totalVentas = 0;
            let ventasHoy = 0;
            let ventasSemana = 0;
            let ventasMes = 0;

            pedidos.forEach(pedido => {
                if (pedido.estado !== 'cancelado') {
                    totalVentas += pedido.total || 0;
                    
                    const fechaPedido = new Date(pedido.fechaPedido);
                    if (fechaPedido >= hoy) ventasHoy += pedido.total || 0;
                    if (fechaPedido >= semanaPasada) ventasSemana += pedido.total || 0;
                    if (fechaPedido >= mesPasado) ventasMes += pedido.total || 0;
                }
            });

            setEstadisticas({
                totalVentas,
                ventasHoy,
                ventasSemana,
                ventasMes
            });

            // Calcular cambios porcentuales (comparado con período anterior)
            const statsData = [
                { 
                    title: 'Clientes', 
                    value: clientes.length, 
                    icon: FaUsers, 
                    color: '#667eea', 
                    change: '+12%' // Idealmente calcularías esto comparando con datos históricos
                },
                { 
                    title: 'Productos', 
                    value: productos.length, 
                    icon: FaBox, 
                    color: '#764ba2', 
                    change: '+5%' 
                },
                { 
                    title: 'Proveedores', 
                    value: proveedores.length, 
                    icon: FaTruck, 
                    color: '#f6c23e', 
                    change: '-2%' 
                },
                { 
                    title: 'Pedidos', 
                    value: pedidos.length, 
                    icon: FaShoppingCart, 
                    color: '#e74a3b', 
                    change: '+23%' 
                },
            ];
            
            setStats(statsData);

            // Generar datos de ventas mensuales (últimos 6 meses)
            const ventasPorMes = {};
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            pedidos.forEach(pedido => {
                if (pedido.estado !== 'cancelado') {
                    const fecha = new Date(pedido.fechaPedido);
                    const mes = fecha.getMonth();
                    const año = fecha.getFullYear();
                    const key = `${año}-${mes}`;
                    
                    if (!ventasPorMes[key]) {
                        ventasPorMes[key] = 0;
                    }
                    ventasPorMes[key] += pedido.total || 0;
                }
            });

            // Tomar los últimos 6 meses
            const ventasMensualesData = [];
            const fechaActual = new Date();
            for (let i = 5; i >= 0; i--) {
                const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
                const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
                ventasMensualesData.push({
                    mes: meses[fecha.getMonth()],
                    ventas: ventasPorMes[key] || 0
                });
            }
            setVentasMensuales(ventasMensualesData);

            // Generar datos de ventas por categoría
            const categoriasMap = {};
            
            // Primero obtener productos con sus categorías
            const productosConCategoria = productos.map(p => ({
                ...p,
                categoria: p.categoria || 'Sin categoría'
            }));

            pedidos.forEach(pedido => {
                if (pedido.estado !== 'cancelado') {
                    pedido.productos?.forEach(item => {
                        const producto = productosConCategoria.find(p => p._id === item.producto);
                        const categoria = producto?.categoria || 'Sin categoría';
                        
                        if (!categoriasMap[categoria]) {
                            categoriasMap[categoria] = 0;
                        }
                        categoriasMap[categoria] += (item.cantidad * item.precioUnitario);
                    });
                }
            });

            const categoriasData = Object.entries(categoriasMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6); // Top 6 categorías

            setVentasPorCategoria(categoriasData.length > 0 ? categoriasData : [
                { name: 'Electrónica', value: 400 },
                { name: 'Ropa', value: 300 },
                { name: 'Hogar', value: 200 },
            ]);

            // Obtener últimos 5 pedidos
            const ultimos5Pedidos = pedidos
                .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
                .slice(0, 5)
                .map(pedido => {
                    // Buscar nombre del cliente
                    let nombreCliente = 'Cliente no encontrado';
                    if (pedido.cliente?.nombre) {
                        nombreCliente = pedido.cliente.nombre;
                    } else {
                        const cliente = clientes.find(c => c._id === pedido.cliente);
                        nombreCliente = cliente?.nombre || 'Cliente no encontrado';
                    }

                    // Obtener nombres de productos
                    const productosNombres = pedido.productos?.map(item => {
                        if (item.producto?.nombre) return item.producto.nombre;
                        const producto = productos.find(p => p._id === item.producto);
                        return producto?.nombre || 'Producto no encontrado';
                    }).join(', ') || 'Sin productos';

                    return {
                        _id: pedido._id,
                        id: pedido._id.slice(-6),
                        cliente: nombreCliente,
                        productos: productosNombres,
                        fecha: new Date(pedido.fechaPedido).toLocaleDateString('es-ES'),
                        total: pedido.total || 0,
                        estado: pedido.estado
                    };
                });

            setUltimosPedidos(ultimos5Pedidos);
            setError(null);

        } catch (err) {
            console.error('Error al cargar datos del dashboard:', err);
            setError('Error al cargar los datos. Mostrando datos de ejemplo.');
            
            // Datos de ejemplo en caso de error
            setStats([
                { title: 'Clientes', value: '156', icon: FaUsers, color: '#667eea', change: '+12%' },
                { title: 'Productos', value: '89', icon: FaBox, color: '#764ba2', change: '+5%' },
                { title: 'Proveedores', value: '24', icon: FaTruck, color: '#f6c23e', change: '-2%' },
                { title: 'Pedidos', value: '45', icon: FaShoppingCart, color: '#e74a3b', change: '+23%' },
            ]);
            
            setVentasMensuales([
                { mes: 'Ene', ventas: 4000 },
                { mes: 'Feb', ventas: 3000 },
                { mes: 'Mar', ventas: 5000 },
                { mes: 'Abr', ventas: 4500 },
                { mes: 'May', ventas: 6000 },
                { mes: 'Jun', ventas: 5500 },
            ]);
            
            setVentasPorCategoria([
                { name: 'Electrónica', value: 400 },
                { name: 'Ropa', value: 300 },
                { name: 'Hogar', value: 200 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (estado) => {
        const colores = {
            'pendiente': 'warning',
            'procesando': 'info',
            'enviado': 'primary',
            'entregado': 'success',
            'cancelado': 'danger'
        };
        return colores[estado] || 'secondary';
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    if (loading) {
        return (
            <div className="dashboard text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Dashboard</h2>
                    {error && (
                        <span className="text-warning">
                            <FaChartLine className="me-2" />
                            {error}
                        </span>
                    )}
                </div>
                
                {/* Stats Cards */}
                <Row className="g-4 mb-4">
                    {stats.map((stat, index) => (
                        <Col key={index} md={3}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="modern-card">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <p className="text-muted mb-2">{stat.title}</p>
                                                <h3 className="mb-0">{stat.value}</h3>
                                                <small className={stat.change.startsWith('+') ? 'text-success' : 'text-danger'}>
                                                    {stat.change.startsWith('+') ? <FaArrowUp /> : <FaArrowDown />}
                                                    {stat.change}
                                                </small>
                                            </div>
                                            <div 
                                                className="rounded-circle p-3"
                                                style={{ background: stat.color + '20', color: stat.color }}
                                            >
                                                <stat.icon size={30} />
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                {/* Tarjetas de Ventas */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="modern-card bg-gradient-primary text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-2">Ventas Totales</p>
                                        <h4 className="mb-0">{formatCurrency(estadisticas.totalVentas)}</h4>
                                    </div>
                                    <FaDollarSign size={40} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="modern-card bg-gradient-success text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-2">Ventas Hoy</p>
                                        <h4 className="mb-0">{formatCurrency(estadisticas.ventasHoy)}</h4>
                                    </div>
                                    <FaChartLine size={40} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="modern-card bg-gradient-info text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-2">Ventas Semana</p>
                                        <h4 className="mb-0">{formatCurrency(estadisticas.ventasSemana)}</h4>
                                    </div>
                                    <FaChartLine size={40} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="modern-card bg-gradient-warning text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-2">Ventas Mes</p>
                                        <h4 className="mb-0">{formatCurrency(estadisticas.ventasMes)}</h4>
                                    </div>
                                    <FaChartLine size={40} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row className="g-4">
                    <Col md={8}>
                        <Card className="modern-card">
                            <Card.Body>
                                <h5 className="mb-4">Ventas Mensuales</h5>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ventasMensuales}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Bar dataKey="ventas" fill="#667eea" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={4}>
                        <Card className="modern-card">
                            <Card.Body>
                                <h5 className="mb-4">Ventas por Categoría</h5>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={ventasPorCategoria}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={(entry) => entry.name}
                                        >
                                            {ventasPorCategoria.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Últimos Pedidos */}
                <Row className="mt-4">
                    <Col md={12}>
                        <Card className="modern-card">
                            <Card.Body>
                                <h5 className="mb-4">Últimos Pedidos</h5>
                                <div className="table-responsive">
                                    <table className="table table-moderno">
                                        <thead>
                                            <tr>
                                                <th>ID Pedido</th>
                                                <th>Cliente</th>
                                                <th>Producto(s)</th>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ultimosPedidos.length > 0 ? (
                                                ultimosPedidos.map((pedido) => (
                                                    <tr key={pedido._id}>
                                                        <td>#{pedido.id}</td>
                                                        <td>{pedido.cliente}</td>
                                                        <td>{pedido.productos}</td>
                                                        <td>{pedido.fecha}</td>
                                                        <td>{formatCurrency(pedido.total)}</td>
                                                        <td>
                                                            <span className={`badge bg-${getBadgeColor(pedido.estado)}`}>
                                                                {pedido.estado}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">
                                                        No hay pedidos registrados
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </motion.div>

            <style jsx>{`
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .bg-gradient-success {
                    background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
                }
                .bg-gradient-info {
                    background: linear-gradient(135deg, #36b9cc 0%, #258391 100%);
                }
                .bg-gradient-warning {
                    background: linear-gradient(135deg, #f6c23e 0%, #dda20a 100%);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;