const EnquiryModel = require("../models/enquiryModel");

const response = (success, statusCode, responseMsg, errorMsg = null, data = null) => ({
  success, statusCode, responseMsg, errorMsg, response: data
});

// Add new enquiry
exports.addEnquiry = async (req, res) => {
  try {
    const { name, phone, location, message, inquiry_type, product, quantity = 1 } = req.body;

    if (!name || !phone || !location || !inquiry_type || !product) {
      return res.status(400).json(response(false, 400, "Required fields missing"));
    }

    const id = await EnquiryModel.create({ name, phone, location, message, inquiry_type, product, quantity });
    res.json(response(true, 201, "Enquiry added successfully", null, { id }));
  } catch (err) {
    console.error('Error adding enquiry:', err);
    res.status(500).json(response(false, 500, "Error adding enquiry", err.message));
  }
};

// Get all enquiries with filters
exports.getAllEnquiries = async (req, res) => {
  try {
    const { search, status, inquiry_type, product, thisMonth, thisWeek } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (inquiry_type) filters.inquiry_type = inquiry_type;
    if (product) filters.product = product;
    if (thisMonth === 'true') filters.thisMonth = true;
    if (thisWeek === 'true') filters.thisWeek = true;

    const enquiries = await EnquiryModel.findAll(filters);
    res.json(response(true, 200, "Enquiries fetched successfully", null, enquiries));
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json(response(false, 500, "Error fetching enquiries", err.message));
  }
};

// Get enquiry by ID
exports.getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await EnquiryModel.findById(id);
    
    if (!enquiry) {
      return res.status(404).json(response(false, 404, "Enquiry not found"));
    }
    
    res.json(response(true, 200, "Enquiry fetched successfully", null, enquiry));
  } catch (err) {
    console.error('Error fetching enquiry:', err);
    res.status(500).json(response(false, 500, "Error fetching enquiry", err.message));
  }
};

// Update enquiry
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if enquiry exists
    const existingEnquiry = await EnquiryModel.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json(response(false, 404, "Enquiry not found"));
    }

    await EnquiryModel.update(id, updateData);
    res.json(response(true, 200, "Enquiry updated successfully"));
  } catch (err) {
    console.error('Error updating enquiry:', err);
    res.status(500).json(response(false, 500, "Error updating enquiry", err.message));
  }
};

// Delete enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if enquiry exists
    const existingEnquiry = await EnquiryModel.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json(response(false, 404, "Enquiry not found"));
    }

    await EnquiryModel.delete(id);
    res.json(response(true, 200, "Enquiry deleted successfully"));
  } catch (err) {
    console.error('Error deleting enquiry:', err);
    res.status(500).json(response(false, 500, "Error deleting enquiry", err.message));
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await EnquiryModel.dashboardStats();
    res.json(response(true, 200, "Dashboard stats fetched", null, stats));
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json(response(false, 500, "Error fetching stats", err.message));
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if enquiry exists
    const existingEnquiry = await EnquiryModel.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json(response(false, 404, "Enquiry not found"));
    }

    await EnquiryModel.updateStatus(id, status);
    res.json(response(true, 200, "Status updated successfully"));
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json(response(false, 500, "Error updating status", err.message));
  }
};

// Mark as contacted
exports.markContacted = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if enquiry exists
    const existingEnquiry = await EnquiryModel.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json(response(false, 404, "Enquiry not found"));
    }

    await EnquiryModel.markContacted(id);
    res.json(response(true, 200, "Enquiry marked as contacted"));
  } catch (err) {
    console.error('Error updating enquiry:', err);
    res.status(500).json(response(false, 500, "Error updating enquiry", err.message));
  }
};

// Schedule pickup
exports.schedulePickup = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if enquiry exists
    const existingEnquiry = await EnquiryModel.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json(response(false, 404, "Enquiry not found"));
    }

    await EnquiryModel.schedulePickup(id);
    res.json(response(true, 200, "Pickup scheduled"));
  } catch (err) {
    console.error('Error scheduling pickup:', err);
    res.status(500).json(response(false, 500, "Error scheduling pickup", err.message));
  }
};

// Get this month enquiries
exports.getThisMonthEnquiries = async (req, res) => {
  try {
    const enquiries = await EnquiryModel.getThisMonth();
    res.json(response(true, 200, "This month enquiries fetched", null, enquiries));
  } catch (err) {
    console.error('Error fetching this month enquiries:', err);
    res.status(500).json(response(false, 500, "Error fetching this month enquiries", err.message));
  }
};

// Get this week enquiries
exports.getThisWeekEnquiries = async (req, res) => {
  try {
    const enquiries = await EnquiryModel.getThisWeek();
    res.json(response(true, 200, "This week enquiries fetched", null, enquiries));
  } catch (err) {
    console.error('Error fetching this week enquiries:', err);
    res.status(500).json(response(false, 500, "Error fetching this week enquiries", err.message));
  }
};

// Get converted enquiries
exports.getConvertedEnquiries = async (req, res) => {
  try {
    const enquiries = await EnquiryModel.getConverted();
    res.json(response(true, 200, "Converted enquiries fetched", null, enquiries));
  } catch (err) {
    console.error('Error fetching converted enquiries:', err);
    res.status(500).json(response(false, 500, "Error fetching converted enquiries", err.message));
  }
};