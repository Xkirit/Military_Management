const mongoose = require('mongoose');
const User = require('./src/models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/military_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateUsersWithBase() {
  try {
    console.log('Adding base assignments to existing users...');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    // Assign bases based on department or randomly
    const baseAssignments = {
      'Operations': 'Base A',
      'Logistics': 'Base B', 
      'Training': 'Base C',
      'Maintenance': 'Base A',
      'Intelligence': 'Headquarters',
      'Medical': 'Base B'
    };

    for (const user of users) {
      const assignedBase = baseAssignments[user.department] || 'Base A';
      
      // Update all users (whether they have base or not)
      if (!user.base || user.base !== assignedBase) {
        user.base = assignedBase;
        await user.save();
        console.log(`Assigned ${user.firstName} ${user.lastName} (${user.department}) to ${assignedBase}`);
      } else {
        console.log(`${user.firstName} ${user.lastName} already assigned to ${user.base}`);
      }
    }

    console.log('Base assignments completed!');

    // Show final distribution
    const baseDistribution = await User.aggregate([
      {
        $group: {
          _id: '$base',
          count: { $sum: 1 },
          departments: { $push: '$department' }
        }
      }
    ]);

    console.log('\n=== BASE DISTRIBUTION ===');
    baseDistribution.forEach(base => {
      console.log(`${base._id}: ${base.count} personnel`);
      const deptCounts = {};
      base.departments.forEach(dept => {
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      Object.entries(deptCounts).forEach(([dept, count]) => {
        console.log(`  - ${dept}: ${count}`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateUsersWithBase(); 