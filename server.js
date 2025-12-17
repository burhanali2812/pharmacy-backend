import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import medicineRoute from './routes/medicineRoute.js';
import invoiceRoute from './routes/invoiceRoute.js';
import supplierRoute from './routes/supplierRoute.js';


const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Pharmacy Backend is Live!");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000, // keep this if you want a timeout
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); 
  }
};


app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/medicine', medicineRoute);
app.use('/invoice', invoiceRoute);
app.use('/supplier', supplierRoute);

const PORT = process.env.PORT || 5000;
connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server Running on PORT ${PORT}`)
    })
})
