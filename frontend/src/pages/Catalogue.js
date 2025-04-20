import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Row, Col, Container, Alert } from 'react-bootstrap';
import './Catalogue.css';

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const sampleProducts = [
     {
        id: 1,
        name: 'Fresh Apples',
        price: 100,
        image_url: 'https://images.everydayhealth.com/images/diet-nutrition/apples-101-about-1440x810.jpg?sfvrsn=f86f2644_5',
      },
      {
        id: 2,
        name: 'Organic Tomatoes',
        price: 80,
        image_url: 'https://abcfruits.com/wp-content/uploads/2022/08/14.png',
      },
      {
        id: 3,
        name: 'Carrots',
        price: 60,
        image_url: 'https://www.hhs1.com/hubfs/carrots%20on%20wood-1.jpg',
      },
      {
        id: 4,
        name: 'Bananas',
        price: 40,
        image_url: 'https://www.lovefoodhatewaste.com/sites/default/files/styles/16_9_two_column/public/2022-07/Bananas.jpg.webp?itok=bqo03oZ1',
      },
      {
        id: 5,
        name: 'Potatoes',
        price: 50,
        image_url: 'https://media.post.rvohealth.io/wp-content/uploads/2020/09/AN440-Potatoes-732x549-thumb-732x549.jpg',
      },
      {
        id: 6,
        name: 'Spinach',
        price: 30,
        image_url: 'https://5.imimg.com/data5/NJ/BM/MY-24691404/fresh-spinach-500x500.jpg',
      },
      {
        id: 7,
        name: 'Avocado',
        price: 60,
        image_url: 'https://www.isaaa.org/kc/cropbiotechupdate/files/images/614202361818AM.jpg',
      },
      {
        id: 8,
        name: 'Orange',
        price: 110,
        image_url: 'https://www.health.com/thmb/OZgW2YQtFb9qJ3PbySNei3YdgPw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Health-Stocksy_txp5e95690asrw300_Medium_934585-e870449543284eed8aa4be52fc09a4ed.jpg',
      },
      {
        id: 9,
        name: 'Strawberry',
        price: 100,
        image_url: 'https://images.everydayhealth.com/images/diet-nutrition/potential-health-benefits-of-strawberries-1440x810.jpg?sfvrsn=8170c471_5',
      },
    ];
    setProducts(sampleProducts);
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product_id: product.id, quantity: 1 }]);
    }
  };

  const handleSubmit = async () => {
    try {
      const buyer_name = prompt("Enter your name:");
      if (!buyer_name) return;

      const buyer_contact = prompt("Enter your contact:");
      if (!buyer_contact) return;

      const delivery_address = prompt("Enter your delivery address:");
      if (!delivery_address) return;

      const response = await axios.post('http://localhost:5000/api/orders', {
        buyer_name,
        buyer_contact,
        delivery_address,
        items: cart,
      });

      alert(`Order placed! Your tracking ID is: ${response.data.tracking_id}`);
      setCart([]);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Order error:', err);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center fw-bold">Fresh Vegetables & Fruits Catalogue</h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product.id}>
            <Card className="product-card h-100 shadow-lg">
              <Card.Img
                variant="top"
                src={product.image_url}
                className="img-fluid"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold text-primary">{product.name}</Card.Title>
                <Card.Text className="text-muted">Price: ₹{product.price}</Card.Text>
                <Button
                  variant="outline-success"
                  className="mt-auto"
                  onClick={() => addToCart(product)}>
                    Add to Cart
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {cart.length > 0 && (
        <div className="text-center mt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            className="w-100 w-md-50">
            🛒 Place Order ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </Button>
        </div>
      )}
    </Container>
  );
}