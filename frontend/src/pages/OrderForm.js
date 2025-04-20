import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';

export default function OrderForm() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    address: '',
    items: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const handleChange = (id, quantity) => {
    setForm((prev) => {
      const existing = prev.items.find(i => i.product_id === id);
      const items = existing
        ? prev.items.map(i => i.product_id === id ? { ...i, quantity } : i)
        : [...prev.items, { product_id: id, quantity }];
      return { ...prev, items };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!form.name || !form.contact || !form.address || form.items.length === 0) {
        throw new Error('Please fill all fields and add at least one item');
      }

      await axios.post('http://localhost:5000/api/orders', {
        buyer_name: form.name,
        buyer_contact: form.contact,
        delivery_address: form.address,
        items: form.items.filter(item => item.quantity > 0),
      });

      setSuccess('Order placed successfully!');
      setForm({
        name: '',
        contact: '',
        address: '',
        items: [],
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Order error:', err);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm p-3">
            <h2 className="text-center mb-4">Place an Order</h2>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="text"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  required
                />
              </Form.Group>

              <h5 className="mt-4 mb-3">Products</h5>
              {products.map(p => (
                <Form.Group key={p.id} className="mb-3">
                  <Form.Label>{p.name} (₹{p.price})</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    onChange={e => handleChange(p.id, Number(e.target.value))}
                  />
                </Form.Group>
              ))}

              <div className="d-grid mt-4">
                <Button variant="success" type="submit" size="lg">
                  Submit Order
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}