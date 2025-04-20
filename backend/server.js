// backend/server.js
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

// Models
const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  price: DataTypes.INTEGER,
  image_url: DataTypes.STRING,
  description: DataTypes.TEXT,
});

const Order = sequelize.define('Order', {
  buyer_name: DataTypes.STRING,
  buyer_contact: DataTypes.STRING,
  delivery_address: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  tracking_id: DataTypes.STRING,
});

const OrderItem = sequelize.define('OrderItem', {
  quantity: DataTypes.INTEGER,
});

// Associations
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

// Virtual field for total price
Order.prototype.getTotal = async function () {
  const items = await this.getOrderItems({ include: [Product] });
  return items.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
};

// Sync and seed
(async () => {
  try {
    await sequelize.sync({ alter: true });

    console.log('✅ DB Synced');

    const count = await Product.count();
    if (count === 0) {
      await Product.bulkCreate([
        { name: 'Tomato', price: 30, image_url: 'https://via.placeholder.com/150' },
        { name: 'Potato', price: 20, image_url: 'https://via.placeholder.com/150' },
        { name: 'Carrot', price: 60, image_url: 'https://via.placeholder.com/150' },
        { name: 'Apple', price: 100, image_url: 'https://via.placeholder.com/150' },
        { name: 'Banana', price: 40, image_url: 'https://via.placeholder.com/150' },
        { name: 'Spinach', price: 30, image_url: 'https://via.placeholder.com/150' },
        { name: 'Avocado', price: 60, image_url: 'https://via.placeholder.com/150' },
        { name: 'Orange', price: 110, image_url: 'https://via.placeholder.com/150' },
        { name: 'Strawberry', price: 100, image_url: 'https://via.placeholder.com/150' },
      ]);
      console.log('🧪 Seeded Products');
    }
  } catch (err) {
    console.error('❌ Error syncing DB:', err);
  }
})();

// Routes
app.get('/', (req, res) => {
  res.send('AgroFix backend is running.');
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, image_url, description } = req.body;
    const product = await Product.create({ name, price, image_url, description });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { buyer_name, buyer_contact, delivery_address, items } = req.body;

    console.log('🛒 New order request:', req.body);

    if (!buyer_name || !buyer_contact || !delivery_address || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid input');
    }

    const tracking_id = `ORD-${uuidv4()}`;

    const order = await Order.create(
      {
        buyer_name,
        buyer_contact,
        delivery_address,
        tracking_id,
      },
      { transaction: t }
    );

    for (let item of items) {
      if (!item.product_id || item.quantity <= 0) {
        throw new Error('Invalid item data');
      }

      await OrderItem.create(
        {
          OrderId: order.id,
          ProductId: item.product_id,
          quantity: item.quantity,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.json({ ...order.toJSON(), tracking_id });
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    await t.rollback();
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Fetch order by tracking_id
app.get('/api/orders/track/:trackingId', async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { tracking_id: req.params.trackingId },
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const total_price = await order.getTotal();
    res.json({ ...order.toJSON(), total_price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order by tracking ID' });
  }
});

// Fetch order by order_id
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const total_price = await order.getTotal();
    res.json({ ...order.toJSON(), total_price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    const enriched = await Promise.all(
      orders.map(async (order) => ({
        ...order.toJSON(),
        total_price: await order.getTotal(),
      }))
    );
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.listen(5000, () => console.log('✅ Server running at http://localhost:5000'));
