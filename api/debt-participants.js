import { MongoClient } from 'mongodb';

const uri = process.env.VITE_MONGO_URI;
const dbName = process.env.VITE_DATABASE_NAME || 'personal_finance_tracker';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('debt_participants');

    if (req.method === 'GET') {
      const participants = await collection.find({}).toArray();
      res.status(200).json({ participants });
    } else if (req.method === 'POST') {
      const { participants } = req.body;
      await collection.deleteMany({});
      if (participants && participants.length > 0) {
        await collection.insertMany(participants);
      }
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}