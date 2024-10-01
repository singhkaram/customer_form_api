const multer = require("multer");
const imagekit = require("../config/imagekit");
const Customer = require("../models/customer");
const Joi = require("joi");

// Set up Multer for in-memory storage (temporary storage before uploading to ImageKit)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit for videos
});

// Export the upload middleware
exports.upload = upload;

// Define your Joi schema and other controller logic...
const customerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  address: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  termsAndConditions: Joi.boolean().required(),
});

const uploadToImageKit = async (file, folder) => {
  try {
    const uploadResponse = await imagekit.upload({
      file: file.buffer, // buffer from multer
      fileName: file.originalname, // original file name
      folder: folder, // ImageKit folder (e.g., 'customers/images/')
    });
    return uploadResponse.url; // Return the URL of the uploaded file
  } catch (error) {
    throw new Error("ImageKit upload failed: " + error.message);
  }
};

// Create customer
exports.createCustomer = async (req, res) => {
  const { name, email, phone, address, termsAndConditions } = req.body;

  const { error } = customerSchema.validate({
    name,
    email,
    phone,
    address,
    termsAndConditions,
  });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    // Check if the email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: "Email already exists" });
    }

    let imageUrl, videoUrl;

    if (req.files["image"]) {
      imageUrl = await uploadToImageKit(
        req.files["image"][0],
        "customers/images"
      );
    }

    if (req.files["video"]) {
      videoUrl = await uploadToImageKit(
        req.files["video"][0],
        "customers/videos"
      );
    }

    const customer = new Customer({
      name,
      email,
      phone,
      address,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      termsAndConditions,
    });

    await customer.save();
    res
      .status(201)
      .json({ message: "Customer created successfully", customer });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Other imports and code...
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find(); // Fetch all customers
    res.status(200).json(customers); // Send the customers back in the response
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving customers", error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  const customerId = req.params.id; // Get customer ID from the URL parameter
  const { name, email, phone, address, termsAndConditions } = req.body;

  const { error } = customerSchema.validate({
    name,
    email,
    phone,
    address,
    termsAndConditions,
  });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    let imageUrl, videoUrl;

    if (req.files["image"]) {
      imageUrl = await uploadToImageKit(
        req.files["image"][0],
        "customers/images"
      );
    }

    if (req.files["video"]) {
      videoUrl = await uploadToImageKit(
        req.files["video"][0],
        "customers/videos"
      );
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        name,
        email,
        phone,
        address,
        imageUrl: imageUrl || undefined, // Use undefined to not overwrite if no new image
        videoUrl: videoUrl || undefined, // Use undefined to not overwrite if no new video
        termsAndConditions,
      },
      { new: true } // Return the updated document
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res
      .status(200)
      .json({
        message: "Customer updated successfully",
        customer: updatedCustomer,
      });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  const customerId = req.params.id; // Get customer ID from the URL parameter

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
