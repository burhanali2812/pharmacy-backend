import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {type: String, required: true, unique: true},
    grandTotal: {type: Number, required: true},
    medicines: [
    {
        name: {type: String, required: true},
        quantity: {type: Number, required: true},
        price: {type: Number, required: true},
        totalPrice: {type: Number, required: true},
    },
],
    discount: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now},
    total: {type: Number, required: true},
});

export default mongoose.model("Invoices", invoiceSchema);
