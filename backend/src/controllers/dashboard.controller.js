const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');
const Expenditure = require('../models/expenditure.model');
const Transfer = require('../models/transfer.model');
const Purchase = require('../models/purchase.model');

exports.getMetrics = async (req, res) => {
  try {
    const { base, role } = req.user;
    const userBase = base;

    console.log(`Dashboard Debug - User: ${role} from ${userBase}`);

    let baseQuery, transferQuery, userIds;

    if (role === 'Admin') {
      // Admin sees data from ALL bases
      console.log('Dashboard Debug - Admin user, fetching data from all bases');
      baseQuery = {}; // No base restriction
      transferQuery = {}; // No base restriction for transfers
      userIds = await User.find({}).select('_id');
    } else {
      // Base Commander and Logistics Officer see only their base data
      console.log(`Dashboard Debug - ${role} user, fetching data from base: ${userBase}`);
      const baseUserIds = await User.find({ base: userBase }).select('_id');
      userIds = baseUserIds;
      baseQuery = { requestedBy: { $in: baseUserIds.map(user => user._id) } };
      transferQuery = {
        $or: [
          { sourceBaseId: userBase },
          { destinationBaseId: userBase }
        ]
      };
    }

    const [
      assignments,
      expenditures,
      transfersOut,
      transfersIn,
      purchases,
      personnel,
      personnelByDept
    ] = await Promise.all([
      Assignment.find(baseQuery).populate('personnel'),
      Expenditure.find(baseQuery),
      role === 'Admin' ? 
        Transfer.aggregate([
          { $match: {} },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]) :
        Transfer.aggregate([
          { $match: { sourceBaseId: userBase } },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]),
      role === 'Admin' ?
        Transfer.aggregate([
          { $match: {} },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]) :
        Transfer.aggregate([
          { $match: { destinationBaseId: userBase } },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]),
      Purchase.find(baseQuery),
      role === 'Admin' ? User.countDocuments({}) : User.countDocuments({ base: userBase }),
      role === 'Admin' ? 
        User.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ]) :
        User.aggregate([
          { $match: { base: userBase } },
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ])
    ]);

    // Calculate net movement values for the base
    const totalOutflowValue = transfersOut.reduce((sum, transfer) => sum + (transfer.totalValue || 0), 0);
    const totalInflowValue = transfersIn.reduce((sum, transfer) => sum + (transfer.totalValue || 0), 0);
    
    // Include purchases as inflow (materials coming into the system)
    const purchaseInflowValue = purchases.reduce((sum, purchase) => {
      return sum + (purchase.quantity * purchase.unitPrice);
    }, 0);
    
    // Total inflow = transfers coming in + purchases
    const totalSystemInflowValue = totalInflowValue + purchaseInflowValue;
    const netBalance = totalSystemInflowValue - totalOutflowValue;

    console.log(`Dashboard Debug - Transfer inflow: $${totalInflowValue}, Purchase inflow: $${purchaseInflowValue}, Transfer outflow: $${totalOutflowValue}, Net balance: $${netBalance}`);

    const totalExpenditures = purchases.reduce((sum, purchase) => {
      return sum + (purchase.quantity * purchase.unitPrice);
    }, 0);

    const personnelByDepartment = {};
    personnelByDept.forEach(dept => {
      personnelByDepartment[dept._id] = dept.count;
    });

    const totalPurchases = purchases.reduce((sum, purchase) => {
      return sum + (purchase.quantity * purchase.unitPrice);
    }, 0);

    res.status(200).json({
      base: userBase,
      summary: {
        totalExpenditures,
        totalPurchases,
        basePersonnel: personnel,
        dateRange: { start: null, end: null }
      },
      netMovement: {
        flowingIn: totalSystemInflowValue,
        flowingOut: totalOutflowValue,
        netBalance
      },
      assignments: {
        total: assignments.length,
        byStatus: assignments.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {})
      },
      expenditures: {
        total: expenditures.length,
        totalAmount: expenditures.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        byStatus: expenditures.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {})
      },
      transfersOut: {
        total: transfersOut.length,
        totalQuantity: transfersOut.reduce((sum, t) => sum + (t.quantity || 0), 0),
        byStatus: transfersOut.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {})
      },
      transfersIn: {
        total: transfersIn.length,
        totalQuantity: transfersIn.reduce((sum, t) => sum + (t.quantity || 0), 0),
        byStatus: transfersIn.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {})
      },
      purchases: {
        total: purchases.length,
        totalAmount: purchases.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0),
        totalQuantity: purchases.reduce((sum, p) => sum + p.quantity, 0),
        byStatus: purchases.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {})
      },
      personnel: {
        total: personnel,
        byDepartment: personnelByDepartment
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
};

exports.getDepartmentSummary = async (req, res) => {
  try {
    const { base } = req.user;
    const userBase = base;

    const baseUserIds = await User.find({ base: userBase }).select('_id');
    const userIds = baseUserIds.map(user => user._id);

    const summary = await Purchase.aggregate([
      { $match: { requestedBy: { $in: userIds } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching department summary',
      error: error.message
    });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const { base } = req.user;
    const { limit = 20 } = req.query;
    const userBase = base;

    const baseUserIds = await User.find({ base: userBase }).select('_id');
    const userIds = baseUserIds.map(user => user._id);

    const [recentAssignments, recentExpenditures, recentTransfers, recentPurchases] = await Promise.all([
      Assignment.find({ assignedBy: { $in: userIds } })
        .populate('personnel', 'firstName lastName')
        .populate('assignedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit)),
      Expenditure.find({ requestedBy: { $in: userIds } })
        .populate('requestedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit)),
      Transfer.find({
        $or: [
          { sourceBaseId: userBase },
          { destinationBaseId: userBase }
        ]
      })
        .populate('requestedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit)),
      Purchase.find({ requestedBy: { $in: userIds } })
        .populate('requestedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
    ]);

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

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.status(200).json(activities.slice(0, limit));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

exports.getNetMovementDetails = async (req, res) => {
  try {
    const { base, role } = req.user;
    const userBase = base;
    
    console.log(`NetMovement Debug - User: ${role} from ${userBase}`);

    let userIds, purchaseQuery, transferQuery;

    if (role === 'Admin') {
      // Admin sees net movement details from ALL bases
      console.log('NetMovement Debug - Admin user, fetching data from all bases');
      userIds = await User.find({}).select('_id');
      purchaseQuery = {};
      transferQuery = {};
    } else {
      // Base Commander and Logistics Officer see only their base data
      console.log(`NetMovement Debug - ${role} user, fetching data for base: ${userBase}`);
      const baseUserIds = await User.find({ base: userBase }).select('_id');
      userIds = baseUserIds;
      purchaseQuery = { requestedBy: { $in: baseUserIds.map(user => user._id) } };
      transferQuery = { $or: [{ sourceBaseId: userBase }, { destinationBaseId: userBase }] };
    }

    console.log('NetMovement Debug - Purchase filter:', purchaseQuery);
    console.log('NetMovement Debug - Transfer filter:', transferQuery);

    const [purchases, transfersOut, transfersIn] = await Promise.all([
      Purchase.aggregate([
        { $match: purchaseQuery },
        {
          $lookup: {
            from: 'users',
            localField: 'requestedBy',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $addFields: {
            totalValue: { $multiply: ['$quantity', '$unitPrice'] }
          }
        }
      ]),
      role === 'Admin' ?
        Transfer.aggregate([
          { $match: {} }, // Admin sees all outgoing transfers
          {
            $lookup: {
              from: 'users',
              localField: 'requestedBy',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]) :
        Transfer.aggregate([
          { $match: { sourceBaseId: userBase } },
          {
            $lookup: {
              from: 'users',
              localField: 'requestedBy',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]),
      role === 'Admin' ?
        Transfer.aggregate([
          { $match: {} }, // Admin sees all incoming transfers
          {
            $lookup: {
              from: 'users',
              localField: 'requestedBy',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ]) :
        Transfer.aggregate([
          { $match: { destinationBaseId: userBase } },
          {
            $lookup: {
              from: 'users',
              localField: 'requestedBy',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'purchases',
              localField: 'equipment',
              foreignField: 'item',
              as: 'equipmentData'
            }
          },
          {
            $addFields: {
              unitPrice: {
                $cond: {
                  if: { $gt: [{ $size: '$equipmentData' }, 0] },
                  then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                  else: 0
                }
              },
              totalValue: {
                $multiply: [
                  '$quantity',
                  {
                    $cond: {
                      if: { $gt: [{ $size: '$equipmentData' }, 0] },
                      then: { $arrayElemAt: ['$equipmentData.unitPrice', 0] },
                      else: 0
                    }
                  }
                ]
              }
            }
          }
        ])
    ]);

    const inflow = [
      ...purchases.map(item => ({
        id: item._id,
        type: 'purchase',
        title: item.item || 'Purchase',
        user: item.user[0] ? `${item.user[0].firstName} ${item.user[0].lastName}` : 'Unknown',
        department: item.department || 'Unknown',
        quantity: item.quantity,
        amount: item.totalValue || 0,
        status: item.status,
        date: item.createdAt,
        details: {
          supplier: item.supplier
        }
      })),
      ...transfersIn.map(item => ({
        id: item._id,
        type: 'transfer',
        title: `${item.equipment} from ${item.sourceBaseId}`,
        user: item.user[0] ? `${item.user[0].firstName} ${item.user[0].lastName}` : 'Unknown',
        department: 'Transfer',
        quantity: item.quantity,
        amount: item.totalValue || 0,
        status: item.status,
        date: item.createdAt,
        details: {
          from: item.sourceBaseId,
          to: item.destinationBaseId
        }
      }))
    ];

    const outflow = transfersOut.map(item => ({
      id: item._id,
      type: 'transfer',
      title: `${item.equipment} to ${item.destinationBaseId}`,
      user: item.user[0] ? `${item.user[0].firstName} ${item.user[0].lastName}` : 'Unknown',
      department: 'Transfer',
      quantity: item.quantity,
      amount: item.totalValue || 0,
      status: item.status,
      date: item.createdAt,
      details: {
        reason: item.reason
      }
    }));

    const inflowTotal = inflow.reduce((sum, item) => sum + item.quantity, 0);
    const outflowTotal = outflow.reduce((sum, item) => sum + item.quantity, 0);
    const inflowValue = inflow.reduce((sum, item) => sum + item.amount, 0);
    const outflowValue = outflow.reduce((sum, item) => sum + item.amount, 0);

    console.log(`NetMovement Debug - Found ${purchases.length} purchases, ${transfersOut.length} outbound transfers, ${transfersIn.length} inbound transfers`);

    res.status(200).json({
      base: role === 'Admin' ? 'All Bases' : userBase,
      summary: {
        inflowTotal,
        outflowTotal,
        netQuantity: inflowTotal - outflowTotal,
        inflowValue,
        outflowValue,
        netValue: inflowValue - outflowValue
      },
      movements: {
        inflow: inflow.sort((a, b) => new Date(b.date) - new Date(a.date)),
        outflow: outflow.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    });
  } catch (error) {
    console.error('Error fetching net movement details:', error);
    res.status(500).json({
      message: 'Error fetching net movement details',
      error: error.message
    });
  }
}; 