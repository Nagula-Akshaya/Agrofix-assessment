import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Row, Col, Badge, ListGroup } from 'react-bootstrap';

export default function TrackOrder() {
  const [id, setId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/track/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Tracking Error:', err);
      setOrder(null);
      setError('Order not found. Make sure the tracking ID is correct and try again.');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm p-3">
            <h2 className="text-center mb-4">Track Order</h2>

            <Form onSubmit={handleTrack}>
              <Form.Group className="mb-3">
                <Form.Label>Tracking ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter tracking ID"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button variant="primary" type="submit">
                  Track Order
                </Button>
              </div>
            </Form>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Card>

          {order && (
            <Card className="mt-4 shadow-sm p-3">
              <h4>Order Details</h4>
              <p><strong>Status:</strong> <Badge bg={
                order.status === 'Delivered' ? 'success' :
                order.status === 'In Progress' ? 'warning' : 'secondary'
              }>{order.status}</Badge></p>
              <p><strong>Tracking ID:</strong> {order.tracking_id}</p>
              <p><strong>Buyer:</strong> {order.buyer_name}</p>
              <p><strong>Contact:</strong> {order.buyer_contact}</p>
              <p><strong>Address:</strong> {order.delivery_address}</p>
              <p><strong>Total:</strong> ₹{order.total_price}</p>

              <h5 className="mt-3">Items</h5>
              <ListGroup>
                {order.OrderItems.map(item => (
                  <ListGroup.Item key={item.id}>
                    {item.Product.name} — Qty: {item.quantity} × ₹{item.Product.price}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}