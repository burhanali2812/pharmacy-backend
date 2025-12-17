import mongoose from 'mongoose';

const saleschema = new mongoose.Schema({
    totalActualPrice: Number,
    totalSalesPrice: Number,
    profit: Number,
    discount: Number
});

export default mongoose.model("DashboardSales", saleschema);
