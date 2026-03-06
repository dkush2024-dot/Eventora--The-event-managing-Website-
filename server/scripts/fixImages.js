const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const events = await mongoose.connection.db.collection('events').find({}).toArray();
    
    for (const event of events) {
      if (event.image && !event.image.includes('f_auto')) {
        const newUrl = event.image.replace('/upload/', '/upload/f_auto,q_auto/');
        await mongoose.connection.db.collection('events').updateOne(
          { _id: event._id },
          { $set: { image: newUrl } }
        );
        console.log('Fixed:', event.title);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixImages();
