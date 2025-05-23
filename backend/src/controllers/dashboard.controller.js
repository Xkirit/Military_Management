const Assignment = require('../models/assignment.model');
const Expenditure = require('../models/expenditure.model');
const Transfer = require('../models/transfer.model');
const Purchase = require('../models/purchase.model');
const User = require('../models/user.model');

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    // Default date range to a broader range (last year) if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear() - 1, 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log(`Dashboard metrics - Date range: ${start.toISOString()} to ${end.toISOString()}`);
    console.log(`Department filter: ${department || 'None'}`);
    
    // Build base query for date filtering
    const dateQuery = {
      createdAt: {
        $gte: start,
        $lte: end
      }
    };
    
    // Add department filter if provided (only for expenditures)
    const expenditureQuery = { ...dateQuery };
    if (department) {
      expenditureQuery.department = department;
    }

    // Get assignments summary
    const assignmentsStats = await Assignment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get expenditures summary
    const expendituresStats = await Expenditure.aggregate([
      {
        $match: expenditureQuery
      },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total expenditure amount
    const totalExpenditures = await Expenditure.aggregate([
      {
        $match: expenditureQuery
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get transfers summary
    const transfersStats = await Transfer.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get purchases summary
    const purchasesStats = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get users by department
    const usersByDepartment = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total purchases amount
    const totalPurchases = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
        }
      }
    ]);

    // Log counts for debugging
    console.log('Database counts:');
    console.log(`- Total purchases in period: ${purchasesStats.reduce((acc, stat) => acc + stat.count, 0)}`);
    console.log(`- Total expenditures in period: ${expendituresStats.reduce((acc, stat) => acc + stat.count, 0)}`);
    console.log(`- Total assignments in period: ${assignmentsStats.reduce((acc, stat) => acc + stat.count, 0)}`);
    console.log(`- Total transfers in period: ${transfersStats.reduce((acc, stat) => acc + stat.count, 0)}`);
    console.log(`- Total users: ${totalUsers}`);

    // Transform data for frontend
    const transformStats = (stats) => {
      const result = {};
      stats.forEach(stat => {
        result[stat._id] = {
          count: stat.count,
          amount: stat.totalAmount || 0
        };
      });
      return result;
    };

    const transformDepartmentStats = (stats) => {
      const result = {};
      stats.forEach(stat => {
        result[stat._id] = stat.count;
      });
      return result;
    };

    const metrics = {
      summary: {
        totalExpenditures: totalExpenditures[0]?.total || 0,
        totalPurchases: totalPurchases[0]?.total || 0,
        totalUsers,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      },
      assignments: {
        total: assignmentsStats.reduce((acc, stat) => acc + stat.count, 0),
        byStatus: transformStats(assignmentsStats)
      },
      expenditures: {
        total: expendituresStats.reduce((acc, stat) => acc + stat.count, 0),
        totalAmount: expendituresStats.reduce((acc, stat) => acc + (stat.totalAmount || 0), 0),
        byStatus: transformStats(expendituresStats)
      },
      transfers: {
        total: transfersStats.reduce((acc, stat) => acc + stat.count, 0),
        byStatus: transformStats(transfersStats)
      },
      purchases: {
        total: purchasesStats.reduce((acc, stat) => acc + stat.count, 0),
        totalAmount: purchasesStats.reduce((acc, stat) => acc + (stat.totalAmount || 0), 0),
        byStatus: transformStats(purchasesStats)
      },
      users: {
        total: totalUsers,
        byDepartment: transformDepartmentStats(usersByDepartment)
      }
    };

    console.log('Sending metrics:', JSON.stringify(metrics, null, 2));
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
};

// Get department-wise summary
exports.getDepartmentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Use broader date range by default
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear() - 1, 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const departmentSummary = await Expenditure.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$department',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          categories: {
            $push: {
              category: '$category',
              amount: '$amount'
            }
          }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.status(200).json(departmentSummary);
  } catch (error) {
    console.error('Department summary error:', error);
    res.status(500).json({
      message: 'Error fetching department summary',
      error: error.message
    });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent assignments
    const recentAssignments = await Assignment.find()
      .populate('personnel', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .select('assignment status createdAt personnel assignedBy');

    // Get recent expenditures
    const recentExpenditures = await Expenditure.find()
      .populate('requestedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .select('description amount status createdAt requestedBy category');

    // Get recent transfers
    const recentTransfers = await Transfer.find()
      .populate('requestedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .select('equipment fromLocation toLocation status createdAt requestedBy');

    // Get recent purchases
    const recentPurchases = await Purchase.find()
      .populate('requestedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .select('item quantity unitPrice status createdAt requestedBy');

    console.log(`Recent activities found: ${recentAssignments.length + recentExpenditures.length + recentTransfers.length + recentPurchases.length}`);

    // Combine and format activities
    const activities = [
      ...recentAssignments.map(item => ({
        id: item._id,
        type: 'assignment',
        title: item.assignment || 'Assignment',
        user: item.personnel ? `${item.personnel.firstName} ${item.personnel.lastName}` : 'Unknown Personnel',
        assignedBy: item.assignedBy ? `${item.assignedBy.firstName} ${item.assignedBy.lastName}` : 'Unknown',
        status: item.status,
        date: item.createdAt
      })),
      ...recentExpenditures.map(item => ({
        id: item._id,
        type: 'expenditure',
        title: item.description || 'Expenditure',
        user: item.requestedBy ? `${item.requestedBy.firstName} ${item.requestedBy.lastName}` : 'Unknown User',
        amount: item.amount || 0,
        category: item.category || 'Other',
        status: item.status,
        date: item.createdAt
      })),
      ...recentTransfers.map(item => ({
        id: item._id,
        type: 'transfer',
        title: `${item.equipment || 'Equipment'}: ${item.fromLocation || 'Unknown'} → ${item.toLocation || 'Unknown'}`,
        user: item.requestedBy ? `${item.requestedBy.firstName} ${item.requestedBy.lastName}` : 'Unknown User',
        status: item.status,
        date: item.createdAt
      })),
      ...recentPurchases.map(item => ({
        id: item._id,
        type: 'purchase',
        title: item.item || 'Purchase Item',
        user: item.requestedBy ? `${item.requestedBy.firstName} ${item.requestedBy.lastName}` : 'Unknown User',
        amount: (item.quantity || 0) * (item.unitPrice || 0),
        status: item.status,
        date: item.createdAt
      }))
    ];

    // Sort by date and limit
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.status(200).json(activities.slice(0, limit));
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
}; 