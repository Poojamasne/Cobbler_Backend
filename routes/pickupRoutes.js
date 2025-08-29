const express = require("express");
const router = express.Router();
const pickupController = require("../controllers/pickupController");

// Dashboard
router.get("/dashboard", pickupController.getPickupDashboardStats);

// Pickups CRUD
router.post("/from-enquiry/:enquiryId", pickupController.createPickup);
router.get("/", pickupController.getAllPickups);
router.get("/:id", pickupController.getPickupById);
router.delete("/:id", pickupController.deletePickup);

// Status management
router.patch("/:id/status", pickupController.updatePickupStatus);
router.patch("/:id/assign", pickupController.assignPickup);
router.patch("/:id/amount", pickupController.updatePickupAmount);
router.patch("/:id/received-details", pickupController.addReceivedDetails);

// Actions
// router.post("/:id/send-invoice", pickupController.sendInvoice);
// router.post("/:id/move-to-service", pickupController.moveToService);

// Filtered pickups
router.get("/status/:status", pickupController.getPickupsByStatus);

module.exports = router;