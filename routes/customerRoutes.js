const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Handle customer creation with image and video file uploads
router.get("/customers", customerController.getAllCustomers);

router.post(
  "/customers",
  customerController.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  customerController.createCustomer
);

// Define routes for updating, fetching, and deleting customers...
router.put(
  "/customers/:id",
  customerController.upload.fields([{ name: "image" }, { name: "video" }]),
  customerController.updateCustomer
);
router.delete("/customers/:id", customerController.deleteCustomer);

module.exports = router;
