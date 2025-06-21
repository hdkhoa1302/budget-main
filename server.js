import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('dist'));

// MongoDB connection
const uri = process.env.VITE_MONGO_URI;
const dbName = process.env.VITE_DATABASE_NAME || 'personal_finance_tracker';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    cachedClient = client;
    console.log('Connected to MongoDB successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Generic handler for collections
async function handleCollection(req, res, collectionName, defaultData = []) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (req.method === 'GET') {
      const data = await collection.find({}).toArray();
      const responseKey = collectionName === 'alert_settings' ? 'settings' : collectionName;
      
      if (collectionName === 'alert_settings') {
        const settings = data.length > 0 ? data[0] : {
          budgetWarningThreshold: 80,
          enableSystemNotifications: true,
          weeklyReports: false,
        };
        res.status(200).json({ settings });
      } else {
        res.status(200).json({ [responseKey]: data });
      }
    } else if (req.method === 'POST') {
      const requestData = req.body;
      
      if (collectionName === 'alert_settings') {
        await collection.deleteMany({});
        await collection.insertOne(requestData.settings);
      } else {
        const dataKey = Object.keys(requestData)[0];
        const data = requestData[dataKey];
        
        await collection.deleteMany({});
        if (data && data.length > 0) {
          await collection.insertMany(data);
        }
      }
      
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Database error for ${collectionName}:`, error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}

// API Routes
app.get('/api/budgets', (req, res) => handleCollection(req, res, 'budgets'));
app.post('/api/budgets', (req, res) => handleCollection(req, res, 'budgets'));

app.get('/api/expenses', (req, res) => handleCollection(req, res, 'expenses'));
app.post('/api/expenses', (req, res) => handleCollection(req, res, 'expenses'));

app.get('/api/debts', (req, res) => handleCollection(req, res, 'debts'));
app.post('/api/debts', (req, res) => handleCollection(req, res, 'debts'));

app.get('/api/debt-participants', (req, res) => handleCollection(req, res, 'debt_participants'));
app.post('/api/debt-participants', (req, res) => handleCollection(req, res, 'debt_participants'));

app.get('/api/debt-payments', (req, res) => handleCollection(req, res, 'debt_payments'));
app.post('/api/debt-payments', (req, res) => handleCollection(req, res, 'debt_payments'));

app.get('/api/alert-settings', (req, res) => handleCollection(req, res, 'alert_settings'));
app.post('/api/alert-settings', (req, res) => handleCollection(req, res, 'alert_settings'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (cachedClient) {
    await cachedClient.close();
  }
  process.exit(0);
});