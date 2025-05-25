const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkDatabaseCollections = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Current Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\n📊 Document counts:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
    // Clean up test collection if it exists
    if (collections.some(c => c.name === 'tests')) {
      console.log('\n🧹 Removing test collection...');
      await mongoose.connection.db.collection('tests').drop();
      console.log('✅ Test collection removed');
    }
    
    // Check if users collection exists and show sample data
    const usersCollection = collections.find(c => c.name === 'users');
    if (usersCollection) {
      console.log('\n👥 Users in database:');
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      users.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.base}`);
      });
    } else {
      console.log('\n❌ No users collection found');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
};

checkDatabaseCollections(); 