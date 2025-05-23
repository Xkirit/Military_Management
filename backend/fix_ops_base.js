const mongoose = require('mongoose');
const User = require('./src/models/user.model');

mongoose.connect('mongodb://localhost:27017/military_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixOpsBase() {
  try {
    const result = await User.updateMany(
      { department: 'Operations', $or: [{ base: { $exists: false } }, { base: null }] },
      { $set: { base: 'Base A' } }
    );
    
    console.log(`Updated ${result.modifiedCount} Operations personnel to Base A`);
    
    // Show final distribution
    const distribution = await User.aggregate([
      { $group: { _id: '$base', count: { $sum: 1 } } }
    ]);
    
    console.log('Final base distribution:');
    distribution.forEach(item => {
      console.log(`${item._id || 'null'}: ${item.count}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixOpsBase(); 