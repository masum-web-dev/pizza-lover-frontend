import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT || process.env.port || 8000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.BETTER_AUTH_DB_URI ||
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.0xcdsqr.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(mongoUri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('You successfully connected to MongoDB!');
    return client;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

const connectedClient = await connectToMongoDB();
const database = connectedClient.db('pizzaloverdb');

const usersCollection = database.collection('users');
const menuItemsCollection = database.collection('menuItems');
const ordersCollection = database.collection('orders');

function isValidObjectId(id) {
  return typeof id === 'string' && ObjectId.isValid(id);
}

function isItemApprovedAndActive(item) {
  const status = String(item.status || 'approved').toLowerCase();
  const active = item.isActive === undefined ? true : Boolean(item.isActive);
  return status === 'approved' && active;
}

app.get('/', (req, res) => {
  res.send('PizzaHub Backend is running!');
});

// GET /api/pizzas
app.get('/api/pizzas', async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      location = '',
      sort = '',
    } = req.query;

    const rawItems = await menuItemsCollection.find({}).toArray();
    let items = rawItems.filter(isItemApprovedAndActive);

    const searchTrimmed = String(search).trim().toLowerCase();
    if (searchTrimmed) {
      items = items.filter((item) => {
        const name = String(item.itemName || item.name || '').toLowerCase();
        const desc = String(item.description || '').toLowerCase();
        const loc = String(item.location || '').toLowerCase();
        return (
          name.includes(searchTrimmed) ||
          desc.includes(searchTrimmed) ||
          loc.includes(searchTrimmed)
        );
      });
    }

    const categoryTrimmed = String(category).trim();
    if (categoryTrimmed && categoryTrimmed.toLowerCase() !== 'all') {
      items = items.filter(
        (item) =>
          String(item.category || '').toLowerCase() ===
          categoryTrimmed.toLowerCase()
      );
    }

    const locationTrimmed = String(location).trim();
    if (locationTrimmed && locationTrimmed.toLowerCase() !== 'all') {
      items = items.filter(
        (item) =>
          String(item.location || '').toLowerCase() ===
          locationTrimmed.toLowerCase()
      );
    }

    if (sort === 'price-asc') {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === 'price-desc') {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      items.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching pizzas:', err);
    res.status(500).json({ message: 'Failed to fetch pizzas' });
  }
});

// GET /api/pizzas/:id
app.get('/api/pizzas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID.' });
    }

    const item = await menuItemsCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching pizza by id:', err);
    res.status(500).json({ message: 'Failed to fetch menu item details.' });
  }
});

// POST /api/pizzas
app.post('/api/pizzas', async (req, res) => {
  try {
    const {
      itemName,
      name,
      category,
      description,
      price,
      location,
      images,
      image,
      vendorId,
      vendorName,
      businessName,
    } = req.body;

    const title = String(itemName || name || '').trim();
    const numericPrice = Number(price);
    const resolvedImages =
      Array.isArray(images) && images.length > 0
        ? images
        : image
        ? [String(image).trim()]
        : [];

    if (!vendorId || !String(vendorId).trim()) {
      return res.status(401).json({ message: 'Vendor authentication required.' });
    }

    if (!title || title.length < 2) {
      return res.status(400).json({ message: 'Item name is required.' });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({ message: 'Category is required.' });
    }

    if (!description || String(description).trim().length < 10) {
      return res
        .status(400)
        .json({ message: 'Description must be at least 10 characters.' });
    }

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Valid price is required.' });
    }

    if (!location || !String(location).trim()) {
      return res.status(400).json({ message: 'Location is required.' });
    }

    if (resolvedImages.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one item image is required.' });
    }

    const vendorIdStr = String(vendorId).trim();

    let vendorUser = null;
    if (isValidObjectId(vendorIdStr)) {
      vendorUser = await usersCollection.findOne({
        _id: new ObjectId(vendorIdStr),
      });
    }

    if (vendorUser?.isBlocked) {
      return res
        .status(403)
        .json({ message: 'Blocked vendors cannot publish menu items.' });
    }

    const effectiveRole = String(vendorUser?.role || 'vendor').toLowerCase();
    if (effectiveRole !== 'vendor' && effectiveRole !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only vendors can add menu items.' });
    }

    const plan = String(vendorUser?.subscriptionPlan || 'free').toLowerCase();
    if (plan !== 'premium') {
      const existingVendorItems = await menuItemsCollection
        .find({ vendorId: vendorIdStr })
        .toArray();

      const activeCount = existingVendorItems.filter((item) => {
        const active = item.isActive === undefined ? true : Boolean(item.isActive);
        const status = String(item.status || '').toLowerCase();
        return active && status !== 'rejected';
      }).length;

      if (activeCount >= 3) {
        return res.status(403).json({
          message:
            'Free plan allows a maximum of 3 active menu items. Upgrade to Premium for unlimited items.',
        });
      }
    }

    const newMenuItem = {
      vendorId: vendorIdStr,
      vendorName: vendorName || vendorUser?.name || 'Vendor',
      businessName:
        businessName ||
        vendorUser?.businessName ||
        vendorUser?.name ||
        'PizzaHub Kitchen',
      itemName: title,
      category: String(category).trim(),
      description: String(description).trim(),
      price: numericPrice,
      location: String(location).trim(),
      images: resolvedImages,
      image: resolvedImages[0],
      status: 'pending',
      isActive: true,
      createdAt: new Date(),
    };

    const result = await menuItemsCollection.insertOne(newMenuItem);

    res.status(201).json({
      message: 'Menu item created with status Pending.',
      id: result.insertedId,
      item: {
        ...newMenuItem,
        _id: result.insertedId,
      },
    });
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ message: 'Failed to create menu item.' });
  }
});

// GET /api/vendor/menu-items
app.get('/api/vendor/menu-items', async (req, res) => {
  try {
    const vendorId = String(req.query.vendorId || '').trim();

    if (!vendorId) {
      return res.status(401).json({ message: 'vendorId is required.' });
    }

    const items = await menuItemsCollection
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching vendor menu items:', err);
    res.status(500).json({ message: 'Failed to load vendor menu items.' });
  }
});

// PATCH /api/vendor/menu-items/:id
app.patch('/api/vendor/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = String(req.body?.vendorId || '').trim();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID.' });
    }

    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor authentication required.' });
    }

    const existing = await menuItemsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existing) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    if (String(existing.vendorId) !== vendorId) {
      return res
        .status(403)
        .json({ message: 'You cannot modify another vendor’s menu item.' });
    }

    const updateFields = {};
    if (
      typeof req.body.itemName === 'string' &&
      req.body.itemName.trim().length >= 2
    ) {
      updateFields.itemName = req.body.itemName.trim();
    }
    if (typeof req.body.category === 'string' && req.body.category.trim()) {
      updateFields.category = req.body.category.trim();
    }
    if (
      typeof req.body.description === 'string' &&
      req.body.description.trim().length >= 10
    ) {
      updateFields.description = req.body.description.trim();
    }
    if (
      req.body.price !== undefined &&
      !Number.isNaN(Number(req.body.price)) &&
      Number(req.body.price) > 0
    ) {
      updateFields.price = Number(req.body.price);
    }
    if (typeof req.body.location === 'string' && req.body.location.trim()) {
      updateFields.location = req.body.location.trim();
    }
    if (typeof req.body.isActive === 'boolean') {
      if (req.body.isActive === true && existing.isActive === false) {
        let vendorUser = null;
        if (isValidObjectId(vendorId)) {
          vendorUser = await usersCollection.findOne({
            _id: new ObjectId(vendorId),
          });
        }
        const plan = String(vendorUser?.subscriptionPlan || 'free').toLowerCase();
        if (plan !== 'premium') {
          const allVendorItems = await menuItemsCollection
            .find({ vendorId })
            .toArray();
          const activeCount = allVendorItems.filter((item) => {
            const active =
              item.isActive === undefined ? true : Boolean(item.isActive);
            const status = String(item.status || '').toLowerCase();
            return active && status !== 'rejected';
          }).length;

          if (activeCount >= 3) {
            return res.status(403).json({
              message:
                'Free plan limit of 3 active items reached. Upgrade to Premium.',
            });
          }
        }
      }
      updateFields.isActive = req.body.isActive;
    }

    updateFields.updatedAt = new Date();

    await menuItemsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    const updatedItem = await menuItemsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      message: 'Menu item updated successfully.',
      item: updatedItem,
    });
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Failed to update menu item.' });
  }
});

// DELETE /api/vendor/menu-items/:id
app.delete('/api/vendor/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = String(
      req.query?.vendorId || req.body?.vendorId || ''
    ).trim();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID.' });
    }

    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor authentication required.' });
    }

    const existing = await menuItemsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existing) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    if (String(existing.vendorId) !== vendorId) {
      return res
        .status(403)
        .json({ message: 'You cannot delete another vendor’s menu item.' });
    }

    await menuItemsCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: 'Menu item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Failed to delete menu item.' });
  }
});

// GET /api/orders/vendor
app.get('/api/orders/vendor', async (req, res) => {
  try {
    const vendorId = String(req.query.vendorId || '').trim();

    if (!vendorId) {
      return res.status(401).json({ message: 'vendorId is required.' });
    }

    const orders = await ordersCollection
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching vendor orders:', err);
    res.status(500).json({ message: 'Failed to load customer orders.' });
  }
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = String(req.body?.vendorId || '').trim();
    const nextStatus = String(req.body?.status || '').trim().toLowerCase();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor authentication required.' });
    }

    if (nextStatus !== 'accepted' && nextStatus !== 'rejected') {
      return res
        .status(400)
        .json({ message: 'Status must be either "accepted" or "rejected".' });
    }

    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (String(order.vendorId) !== vendorId) {
      return res
        .status(403)
        .json({ message: 'You cannot modify orders belonging to another vendor.' });
    }

    const currentStatus = String(order.status || 'pending').toLowerCase();
    if (currentStatus !== 'pending') {
      return res.status(400).json({
        message: `Order is already "${currentStatus}". Only pending orders can be updated once.`,
      });
    }

    await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: nextStatus,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      message: `Order ${nextStatus} successfully.`,
      status: nextStatus,
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

// GET /api/admin/menu-items
app.get('/api/admin/menu-items', async (req, res) => {
  try {
    const statusFilter = String(req.query.status || 'all').trim().toLowerCase();
    const allItems = await menuItemsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const filtered =
      statusFilter === 'all'
        ? allItems
        : allItems.filter(
            (item) =>
              String(item.status || 'pending').toLowerCase() === statusFilter
          );

    res.status(200).json(filtered);
  } catch (err) {
    console.error('Error fetching admin menu items:', err);
    res.status(500).json({ message: 'Failed to load menu items for admin.' });
  }
});

// PATCH /api/admin/menu-items/:id/status
app.patch('/api/admin/menu-items/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const nextStatus = String(req.body?.status || '').trim().toLowerCase();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID.' });
    }

    if (!['pending', 'approved', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({
        message: 'Status must be "pending", "approved", or "rejected".',
      });
    }

    const existing = await menuItemsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existing) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    await menuItemsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: nextStatus,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    const updatedItem = await menuItemsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      message: `Menu item marked as ${nextStatus}.`,
      status: nextStatus,
      item: updatedItem,
    });
  } catch (err) {
    console.error('Error updating menu item approval status:', err);
    res.status(500).json({ message: 'Failed to update menu item status.' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
  try {
    const roleFilter = String(req.query.role || 'all').trim().toLowerCase();
    const allUsers = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const sanitized = allUsers.map((u) => ({
      _id: u._id,
      name: u.name || 'Unnamed User',
      email: u.email || '',
      role: String(u.role || 'customer').toLowerCase(),
      businessName: u.businessName || '',
      subscriptionPlan: String(u.subscriptionPlan || 'free').toLowerCase(),
      isBlocked: Boolean(u.isBlocked),
      createdAt: u.createdAt || null,
    }));

    const filtered =
      roleFilter === 'all'
        ? sanitized
        : sanitized.filter((u) => u.role === roleFilter);

    res.status(200).json(filtered);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ message: 'Failed to load users.' });
  }
});

// PATCH /api/admin/users/:id/block
app.patch('/api/admin/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    if (typeof isBlocked !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'isBlocked must be true or false.' });
    }

    const existing = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (String(existing.role || '').toLowerCase() === 'admin') {
      return res
        .status(403)
        .json({ message: 'Admin accounts cannot be blocked.' });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isBlocked,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      message: isBlocked
        ? 'User has been blocked.'
        : 'User has been unblocked.',
      isBlocked,
    });
  } catch (err) {
    console.error('Error updating user block status:', err);
    res.status(500).json({ message: 'Failed to update user status.' });
  }
});

// POST /api/orders — Customer places a new order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      itemId,
      customerId,
      customerName,
      customerEmail,
      deliveryDate,
      deliveryAddress,
      message,
    } = req.body;

    if (!customerId || !String(customerId).trim()) {
      return res.status(401).json({ message: 'Customer login is required to place an order.' });
    }

    if (!itemId || !isValidObjectId(String(itemId).trim())) {
      return res.status(400).json({ message: 'Valid menu item ID is required.' });
    }

    if (!deliveryDate || !String(deliveryDate).trim()) {
      return res.status(400).json({ message: 'Delivery date is required.' });
    }

    if (!deliveryAddress || String(deliveryAddress).trim().length < 5) {
      return res.status(400).json({ message: 'Valid delivery address is required.' });
    }

    const menuItem = await menuItemsCollection.findOne({
      _id: new ObjectId(String(itemId).trim()),
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    const status = String(menuItem.status || 'approved').toLowerCase();
    const isActive = menuItem.isActive === undefined ? true : Boolean(menuItem.isActive);
    if (status !== 'approved' || !isActive) {
      return res.status(400).json({ message: 'This menu item is currently unavailable for order.' });
    }

    const newOrder = {
      itemId: String(menuItem._id),
      itemName: menuItem.itemName || menuItem.name || 'Pizza Item',
      itemImage:
        (Array.isArray(menuItem.images) && menuItem.images[0]) ||
        menuItem.image ||
        '/Logo.jpg',
      price: Number(menuItem.price || 0),
      vendorId: String(menuItem.vendorId || ''),
      vendorName: menuItem.businessName || menuItem.vendorName || 'PizzaHub Kitchen',
      customerId: String(customerId).trim(),
      customerName: String(customerName || 'Customer').trim(),
      customerEmail: String(customerEmail || '').trim(),
      deliveryDate: String(deliveryDate).trim(),
      deliveryAddress: String(deliveryAddress).trim(),
      message: String(message || '').trim(),
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(newOrder);

    res.status(201).json({
      message: 'Order placed successfully!',
      id: result.insertedId,
      order: {
        ...newOrder,
        _id: result.insertedId,
      },
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// GET /api/orders/customer — Get logged-in customer's orders
app.get('/api/orders/customer', async (req, res) => {
  try {
    const customerId = String(req.query.customerId || '').trim();

    if (!customerId) {
      return res.status(401).json({ message: 'customerId is required.' });
    }

    const orders = await ordersCollection
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ message: 'Failed to load your orders.' });
  }
});

// PATCH /api/orders/:id/cancel — Customer cancels a pending order
app.patch('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = String(req.body?.customerId || '').trim();

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    if (!customerId) {
      return res.status(401).json({ message: 'Customer authentication required.' });
    }

    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (String(order.customerId) !== customerId) {
      return res.status(403).json({ message: 'You can only cancel your own orders.' });
    }

    const currentStatus = String(order.status || 'pending').toLowerCase();
    if (currentStatus !== 'pending') {
      return res.status(400).json({
        message: `Cannot cancel an order that is already "${currentStatus}".`,
      });
    }

    await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'cancelled',
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      message: 'Order cancelled successfully.',
      status: 'cancelled',
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Failed to cancel order.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});