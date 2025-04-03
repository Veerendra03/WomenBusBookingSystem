const mongoose = require('mongoose');
const Bus = require('./models/Bus');

// MongoDB connection string (replace with your actual connection string)
const MONGODB_URI = 'mongodb+srv://veerendrasurampudi94:Raghava1234@cluster0.vdrekus.mongodb.net/zest-travel?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

async function removeDuplicateBuses() {
  const buses = await Bus.find();
  const seen = new Map();
  for (const bus of buses) {
    const key = bus.busNumber;
    if (seen.has(key)) {
      await Bus.deleteOne({ _id: bus._id });
      console.log(`Removed duplicate bus: ${bus.busNumber}`);
    } else {
      seen.set(key, true);
    }
  }
  console.log('Duplicate removal completed');
}

removeDuplicateBuses()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error('Error during duplicate removal:', err);
    mongoose.connection.close();
  });