const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/enquiryController");

// Dashboard
router.get("/dashboard", enquiryController.getDashboardStats);

router.post("/", enquiryController.addEnquiry);
router.get("/", enquiryController.getAllEnquiries);
router.get("/:id", enquiryController.getEnquiryById);
router.put("/:id", enquiryController.updateEnquiry);
router.delete("/:id", enquiryController.deleteEnquiry);

// Filtered enquiries
router.get("/filter/this-month", enquiryController.getThisMonthEnquiries);
router.get("/filter/this-week", enquiryController.getThisWeekEnquiries);
router.get("/filter/converted", enquiryController.getConvertedEnquiries);

// Actions
router.patch("/:id/status", enquiryController.updateStatus);
router.patch("/:id/contacted", enquiryController.markContacted);
router.patch("/:id/pickup", enquiryController.schedulePickup);

module.exports = router;