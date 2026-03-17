
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
    FaUsers, FaBox, FaTruck, FaShoppingCart, 
    FaDollarSign, FaChartLine, FaArrowUp, FaArrowDown 
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
    const stats = [
        { title: 'Clientes', value: '156', icon: FaUsers, color: '#667eea', change: '+12%' },
        { title: 'Productos', value: '89', icon: FaBox, color: '#764ba2', change: '+5%' },
        { title: 'Proveedores', value: '24', icon: FaTruck, color: '#f6c23e', change: '-2%' },
        { title: 'Pedidos', value: '45', icon: FaShoppingCart, color: '#e74a3b', change: '+23%' },
    ];

    const ventasData = [
        { mes: 'Ene', ventas: 4000 },
        { mes: 'Feb', ventas: 3000 },
        { mes: 'Mar', ventas: 5000 },
        { mes: 'Abr', ventas: 4500 },
        { mes: 'May', ventas: 6000 },
        { mes: 'Jun', ventas: 5500 },
    ];

    const categoriasData = [
        { name: 'Electrónica', value: 400 },
        { name: 'Ropa', value: 300 },
        { name: 'Hogar', value: 200 },
        { name: 'Deportes', value: 100 },
    ];

    const COLORS = ['#667eea', '#764ba2', '#f6c23e', '#e74a3b'];

    return (
        <div className="dashboard">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="mb-4">Dashboard</h2>
                
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

                {/* Charts */}
                <Row className="g-4">
                    <Col md={8}>
                        <Card className="modern-card">
                            <Card.Body>
                                <h5 className="mb-4">Ventas Mensuales</h5>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ventasData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip />
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
                                            data={categoriasData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {categoriasData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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
                                                <th>Producto</th>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>#001</td>
                                                <td>Juan Pérez</td>
                                                <td>Laptop HP</td>
                                                <td>15/03/2024</td>
                                                <td>$599.99</td>
                                                <td><span className="badge bg-success">Entregado</span></td>
                                            </tr>
                                            <tr>
                                                <td>#002</td>
                                                <td>María García</td>
                                                <td>Mouse Inalámbrico</td>
                                                <td>14/03/2024</td>
                                                <td>$19.99</td>
                                                <td><span className="badge bg-warning">Procesando</span></td>
                                            </tr>
                                            <tr>
                                                <td>#003</td>
                                                <td>Carlos López</td>
                                                <td>Teclado Mecánico</td>
                                                <td>13/03/2024</td>
                                                <td>$89.99</td>
                                                <td><span className="badge bg-info">Enviado</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </motion.div>
        </div>
    );
};

export default Dashboard;