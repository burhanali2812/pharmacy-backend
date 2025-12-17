import mongoose from 'mongoose';

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

export default mongoose.model("Medicine", medicineShema);
