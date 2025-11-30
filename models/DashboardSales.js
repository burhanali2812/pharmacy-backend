const mongoose = require('mongoose');

const saleschema = new mongoose.Schema({
    totalActualPrice: Number,
    totalSalesPrice: Number,
    profit: Number,
    discount: Number
});
module.exports = mongoose.model("DashboardSales", saleschema);