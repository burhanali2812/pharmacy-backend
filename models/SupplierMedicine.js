const mongoose = require('mongoose');

const medicineShema = new mongoose.Schema({
    sID: Number,
    name: String,
    quantity: Number,
    price: Number,
    expire: String,
    prescription: String,
    actualPrice: Number,
    profit: Number,
    supplier: String
});
module.exports = mongoose.model("SupplierMedicine", medicineShema);