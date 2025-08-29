const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const enquiryRoutes = require("./routes/enquiryRoutes");
const pickupRoutes = require("./routes/pickupRoutes"); 

// Init App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/pickup", pickupRoutes); 

// Default Route
app.get("/", (req, res) => {
  res.send("✅ CRM Backend Running...");
});

// Export app (useful for testing)
module.exports = app;
