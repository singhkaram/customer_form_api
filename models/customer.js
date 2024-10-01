const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  },
  imageUrl: { type: String },
  videoUrl: { type: String },
  termsAndConditions: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
