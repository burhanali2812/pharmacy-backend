import mongoose from 'mongoose';

const medicineShema = new mongoose.Schema({
    sID: {type: Number, required: true , unique: true},
    name:{
        type: String,
        required: true,
        unique: true,
    } ,
    quantity:{type: Number, required: true},
    price: {type: Number, required: true},
    expire: {type: Date, required: true},
    prescription: {type: String, required: true},
    actualPrice: {type: Number, required: true},
    profit: {type: Number, required: true},     
    supplier: {type: String, required: true}
});

export default mongoose.model("Medicine", medicineShema);