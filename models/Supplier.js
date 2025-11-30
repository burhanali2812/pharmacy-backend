const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    licenseNumber : {type: String, required: true, unique: true},
    name: {type: String, required: true },
    address: {type: String, required: true },
    medicineQuantity: {type: Number, required: true, default: 0},
    totalCost: {type: Number, required: true, default: 0},
    paidAmount: {type: Number, required: true, default: 0},
    contact: {type: String, required: true, unique: true},
    isPast: { type: Boolean, default: false },
    joinedAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model("Supplier", supplierSchema);