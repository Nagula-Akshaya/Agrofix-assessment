import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Badge, Form } from 'react-bootstrap';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Admin Dashboard</h2>
      <Row>
        {orders.map(order => (
          <Col key={order.id} xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100 shadow-sm p-3">
              <h5 className="mb-2">Order #{order.id}</h5>
              <p><strong>Buyer:</strong> {order.buyer_name}</p>
              <p><strong>Contact:</strong> {order.buyer_contact}</p>
              <p><strong>Address:</strong> {order.delivery_address}</p>
              <p><strong>Tracking ID:</strong> {order.tracking_id}</p>
              <p>
                <strong>Status:</strong>{' '}
                <Badge bg={order.status === 'Delivered' ? 'success' : order.status === 'In Progress' ? 'warning' : 'secondary'}>
                  {order.status}
                </Badge>
              </p>
              <p><strong>Total Price:</strong> ₹{order.total_price}</p>
              <h6>Items:</h6>
              <ul>
                {order.OrderItems.map(item => (
                  <li key={item.id}>
                    {item.Product.name} — Qty: {item.quantity}
                  </li>
                ))}
              </ul>
              <div className="mt-2">
                <Form.Label><strong>Update Status:</strong></Form.Label>
                <Form.Select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delivered">Delivered</option>
                </Form.Select>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}