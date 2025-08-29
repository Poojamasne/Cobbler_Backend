const PickupModel = require("../models/pickupModel");

const response = (success, statusCode, responseMsg, errorMsg = null, data = null) => ({
  success, statusCode, responseMsg, errorMsg, response: data
});

// Create pickup from enquiry
exports.createPickup = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { assigned_to, amount, scheduled_date } = req.body;

    if (!assigned_to || !amount) {
      return res.status(400).json(response(false, 400, "Assigned staff and amount are required"));
    }

    const pickupId = await PickupModel.createFromEnquiry(enquiryId, {
      assigned_to,
      amount: parseFloat(amount),
      scheduled_date: scheduled_date || new Date()
    });

    res.json(response(true, 201, "Pickup scheduled successfully", null, { id: pickupId }));
  } catch (err) {
    console.error('Error creating pickup:', err);
    res.status(500).json(response(false, 500, "Error scheduling pickup", err.message));
  }
};

// Get all pickups
exports.getAllPickups = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;

    const pickups = await PickupModel.findAll(filters);
    res.json(response(true, 200, "Pickups fetched successfully", null, pickups));
  } catch (err) {
    console.error('Error fetching pickups:', err);
    res.status(500).json(response(false, 500, "Error fetching pickups", err.message));
  }
};

// Get pickup by ID
exports.getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupModel.findById(id);
    
    if (!pickup) {
      return res.status(404).json(response(false, 404, "Pickup not found"));
    }
    
    res.json(response(true, 200, "Pickup fetched successfully", null, pickup));
  } catch (err) {
    console.error('Error fetching pickup:', err);
    res.status(500).json(response(false, 500, "Error fetching pickup", err.message));
  }
};

// Update pickup status
exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'assigned', 'collected', 'received'].includes(status)) {
      return res.status(400).json(response(false, 400, "Invalid status"));
    }

    await PickupModel.updateStatus(id, status);
    res.json(response(true, 200, "Pickup status updated successfully"));
  } catch (err) {
    console.error('Error updating pickup status:', err);
    res.status(500).json(response(false, 500, "Error updating pickup status", err.message));
  }
};

// Assign pickup to staff
exports.assignPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json(response(false, 400, "Staff name is required"));
    }

    await PickupModel.assignPickup(id, assigned_to);
    res.json(response(true, 200, "Pickup assigned successfully"));
  } catch (err) {
    console.error('Error assigning pickup:', err);
    res.status(500).json(response(false, 500, "Error assigning pickup", err.message));
  }
};

// Update pickup amount
exports.updatePickupAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json(response(false, 400, "Valid amount is required"));
    }

    await PickupModel.updateAmount(id, parseFloat(amount));
    res.json(response(true, 200, "Pickup amount updated successfully"));
  } catch (err) {
    console.error('Error updating pickup amount:', err);
    res.status(500).json(response(false, 500, "Error updating pickup amount", err.message));
  }
};

// Add received condition details
exports.addReceivedDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { photo_url, notes, condition } = req.body;

    if (!photo_url) {
      return res.status(400).json(response(false, 400, "Photo URL is required"));
    }

    await PickupModel.addReceivedDetails(id, { photo_url, notes, condition });
    res.json(response(true, 200, "Received details added successfully"));
  } catch (err) {
    console.error('Error adding received details:', err);
    res.status(500).json(response(false, 500, "Error adding received details", err.message));
  }
};

// Delete pickup
exports.deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    await PickupModel.delete(id);
    res.json(response(true, 200, "Pickup deleted successfully"));
  } catch (err) {
    console.error('Error deleting pickup:', err);
    res.status(500).json(response(false, 500, "Error deleting pickup", err.message));
  }
};

// Get dashboard stats
exports.getPickupDashboardStats = async (req, res) => {
  try {
    const stats = await PickupModel.dashboardStats();
    res.json(response(true, 200, "Pickup dashboard stats fetched", null, stats));
  } catch (err) {
    console.error('Error fetching pickup stats:', err);
    res.status(500).json(response(false, 500, "Error fetching pickup stats", err.message));
  }
};

// Get pickups by status
exports.getPickupsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const pickups = await PickupModel.findByStatus(status);
    res.json(response(true, 200, `${status} pickups fetched successfully`, null, pickups));
  } catch (err) {
    console.error('Error fetching pickups by status:', err);
    res.status(500).json(response(false, 500, "Error fetching pickups", err.message));
  }
};


// // Send invoice (placeholder - integrate with your invoice system)
// exports.sendInvoice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const pickup = await PickupModel.findById(id);
    
//     if (!pickup) {
//       return res.status(404).json(response(false, 404, "Pickup not found"));
//     }

//     // Here you would integrate with your invoice generation service
//     // For now, just return success
//     res.json(response(true, 200, "Invoice sent successfully"));
//   } catch (err) {
//     console.error('Error sending invoice:', err);
//     res.status(500).json(response(false, 500, "Error sending invoice", err.message));
//   }
// };

// exports.moveToService = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { service_notes } = req.body;

//     // Update status to received and add service notes
//     await PickupModel.updateStatus(id, 'received');
    
//     if (service_notes) {
//       await db.query(
//         `UPDATE pickup_requests SET service_notes = ?, updated_at = NOW() WHERE id = ?`,
//         [service_notes, id]
//       );
//     }

//     res.json(response(true, 200, "Item moved to service successfully"));
//   } catch (err) {
//     console.error('Error moving to service:', err);
//     res.status(500).json(response(false, 500, "Error moving to service", err.message));
//   }
// };
