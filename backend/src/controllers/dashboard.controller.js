const Assignment = require('../models/assignment.model');
const Expenditure = require('../models/expenditure.model');
const Transfer = require('../models/transfer.model');
const Purchase = require('../models/purchase.model');
const User = require('../models/user.model');

// Get base-specific dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { department } = req.query; // Remove date filtering
    const userBase = req.user.base; // Get user's base from authenticated user
    
    console.log(`Dashboard metrics for ${userBase} - All-time data`);
    console.log(`Department filter: ${department || 'None'}`);
    
    // No date filtering - show all-time data
    const dateQuery = {}; // Empty query for all-time data

    // Get base-specific user IDs (personnel from this base)
    const baseUserIds = await User.find({ base: userBase }).distinct('_id');
    console.log(`Found ${baseUserIds.length} personnel in ${userBase}`);

    // Build base-specific queries
    const baseQuery = {
      requestedBy: { $in: baseUserIds }
    };

    // Get assignments for base personnel
    const assignmentsStats = await Assignment.aggregate([
      {
        $match: {
          personnel: { $in: baseUserIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get expenditures by base personnel
    const expenditureQuery = {};
    if (department) {
      expenditureQuery.department = department;
    }
    
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

    // Get transfers OUT of this base (source = current base)
    const transfersOutStats = await Transfer.aggregate([
      {
        $match: {
          sourceBaseId: userBase
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Get transfers INTO this base (destination = current base)
    const transfersInStats = await Transfer.aggregate([
      {
        $match: {
          destinationBaseId: userBase
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Get purchases by base personnel
    const purchasesStats = await Purchase.aggregate([
      {
        $match: baseQuery
      },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Calculate net movement
    const totalTransfersOut = transfersOutStats.reduce((acc, stat) => acc + (stat.totalQuantity || 0), 0);
    const totalTransfersIn = transfersInStats.reduce((acc, stat) => acc + (stat.totalQuantity || 0), 0);
    const totalPurchasesQuantity = purchasesStats.reduce((acc, stat) => acc + (stat.totalQuantity || 0), 0);
    
    const netMovement = {
      flowingIn: totalTransfersIn + totalPurchasesQuantity, // Materials coming into base
      flowingOut: totalTransfersOut, // Materials leaving base
      netBalance: (totalTransfersIn + totalPurchasesQuantity) - totalTransfersOut
    };

    // Get base personnel count
    const basePersonnelCount = await User.countDocuments({ base: userBase });
    
    // Get personnel by department within the base
    const personnelByDepartment = await User.aggregate([
      {
        $match: { base: userBase }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total amounts
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

    const totalPurchases = await Purchase.aggregate([
      {
        $match: baseQuery
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
        }
      }
    ]);

    // Transform data for frontend
    const transformStats = (stats) => {
      const result = {};
      stats.forEach(stat => {
        result[stat._id] = {
          count: stat.count,
          amount: stat.totalAmount || 0,
          quantity: stat.totalQuantity || 0
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
      base: userBase,
      summary: {
        totalExpenditures: totalExpenditures[0]?.total || 0,
        totalPurchases: totalPurchases[0]?.total || 0,
        basePersonnel: basePersonnelCount,
        period: 'All-time'
      },
      netMovement,
      assignments: {
        total: assignmentsStats.reduce((acc, stat) => acc + stat.count, 0),
        byStatus: transformStats(assignmentsStats)
      },
      expenditures: {
        total: expendituresStats.reduce((acc, stat) => acc + stat.count, 0),
        totalAmount: expendituresStats.reduce((acc, stat) => acc + (stat.totalAmount || 0), 0),
        byStatus: transformStats(expendituresStats)
      },
      transfersOut: {
        total: transfersOutStats.reduce((acc, stat) => acc + stat.count, 0),
        totalQuantity: totalTransfersOut,
        byStatus: transformStats(transfersOutStats)
      },
      transfersIn: {
        total: transfersInStats.reduce((acc, stat) => acc + stat.count, 0),
        totalQuantity: totalTransfersIn,
        byStatus: transformStats(transfersInStats)
      },
      purchases: {
        total: purchasesStats.reduce((acc, stat) => acc + stat.count, 0),
        totalAmount: purchasesStats.reduce((acc, stat) => acc + (stat.totalAmount || 0), 0),
        totalQuantity: totalPurchasesQuantity,
        byStatus: transformStats(purchasesStats)
      },
      personnel: {
        total: basePersonnelCount,
        byDepartment: transformDepartmentStats(personnelByDepartment)
      }
    };

    console.log(`Sending base-specific metrics for ${userBase}:`, JSON.stringify(metrics, null, 2));
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
    console.log('Getting department summary - All-time data');

    const departmentSummary = await Expenditure.aggregate([
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

// Get detailed net movement information
exports.getNetMovementDetails = async (req, res) => {
  try {
    const userBase = req.user.base;
    
    console.log(`Getting net movement details for ${userBase} - All-time data`);
    
    // Get base personnel IDs
    const baseUserIds = await User.find({ base: userBase }).distinct('_id');
    
    // Get purchases (inflow) with equipment details - all-time
    const purchases = await Purchase.find({
      requestedBy: { $in: baseUserIds }
    })
    .populate('requestedBy', 'firstName lastName rank department')
    .sort('-createdAt')
    .limit(50);
    
    // Get transfers OUT (outflow) - all-time
    const transfersOut = await Transfer.find({
      sourceBaseId: userBase
    })
    .populate('requestedBy', 'firstName lastName rank department')
    .sort('-createdAt')
    .limit(50);
    
    // Get transfers IN (inflow) - all-time
    const transfersIn = await Transfer.find({
      destinationBaseId: userBase
    })
    .populate('requestedBy', 'firstName lastName rank department')
    .sort('-createdAt')
    .limit(50);
    
    // Format the data for frontend
    const movements = {
      inflow: [
        ...purchases.map(purchase => ({
          id: purchase._id,
          type: 'purchase',
          title: purchase.item,
          category: purchase.category,
          quantity: purchase.quantity,
          amount: purchase.quantity * purchase.unitPrice,
          status: purchase.status,
          date: purchase.createdAt,
          user: purchase.requestedBy ? 
            `${purchase.requestedBy.firstName} ${purchase.requestedBy.lastName}` : 
            'Unknown',
          department: purchase.requestedBy?.department || purchase.department,
          details: {
            supplier: purchase.supplier,
            unitPrice: purchase.unitPrice,
            specifications: purchase.specifications
          }
        })),
        ...transfersIn.map(transfer => ({
          id: transfer._id,
          type: 'transfer_in',
          title: `Transfer from ${transfer.sourceBaseId}`,
          category: 'Transfer',
          quantity: transfer.quantity,
          amount: 0, // Transfers don't have monetary value
          status: transfer.status,
          date: transfer.createdAt,
          user: transfer.requestedBy ? 
            `${transfer.requestedBy.firstName} ${transfer.requestedBy.lastName}` : 
            'Unknown',
          department: transfer.requestedBy?.department || 'Unknown',
          details: {
            equipmentId: transfer.equipmentId,
            reason: transfer.reason,
            transportMethod: transfer.transportMethod
          }
        }))
      ],
      outflow: transfersOut.map(transfer => ({
        id: transfer._id,
        type: 'transfer_out',
        title: `Transfer to ${transfer.destinationBaseId}`,
        category: 'Transfer',
        quantity: transfer.quantity,
        amount: 0,
        status: transfer.status,
        date: transfer.createdAt,
        user: transfer.requestedBy ? 
          `${transfer.requestedBy.firstName} ${transfer.requestedBy.lastName}` : 
          'Unknown',
        department: transfer.requestedBy?.department || 'Unknown',
        details: {
          equipmentId: transfer.equipmentId,
          reason: transfer.reason,
          transportMethod: transfer.transportMethod
        }
      }))
    };
    
    // Calculate totals
    const summary = {
      inflowTotal: movements.inflow.reduce((acc, item) => acc + item.quantity, 0),
      inflowValue: movements.inflow.reduce((acc, item) => acc + item.amount, 0),
      outflowTotal: movements.outflow.reduce((acc, item) => acc + item.quantity, 0),
      outflowValue: movements.outflow.reduce((acc, item) => acc + item.amount, 0),
      netQuantity: movements.inflow.reduce((acc, item) => acc + item.quantity, 0) - 
                   movements.outflow.reduce((acc, item) => acc + item.quantity, 0),
      netValue: movements.inflow.reduce((acc, item) => acc + item.amount, 0) - 
                movements.outflow.reduce((acc, item) => acc + item.amount, 0)
    };
    
    res.status(200).json({
      base: userBase,
      period: 'All-time',
      summary,
      movements
    });
  } catch (error) {
    console.error('Net movement details error:', error);
    res.status(500).json({
      message: 'Error fetching net movement details',
      error: error.message
    });
  }
}; 