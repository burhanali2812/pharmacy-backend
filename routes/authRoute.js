import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DashboardSales from '../models/DashboardSales.js';
import userAuthrization from '../middleware/authMiddleWare.js';

const router = express.Router();
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, contact, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email Already Registered! " })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashPassword, contact, role });
        await newUser.save();
        res.status(201).json({ message: "Account Created Successfully! " });
    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });

    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password , role} = req.body;

        const user = await User.findOne({ email, role }); 
        if (!user) return res.status(400).json({ message: "Invalid email, password, or role" });


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: "Login Successful", token , role, email});
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/addPrice",userAuthrization, async (req, res) => {
    try {
        const { actualPrice, salesPrice, discountPercentage } = req.body;

        let existingData = await DashboardSales.findOne();

        if (!existingData) {
            existingData = new DashboardSales({
                totalActualPrice: actualPrice,
                totalSalesPrice: salesPrice,
                discount: 0, 
                profit: 0 
            });
        } else {
            existingData.totalActualPrice += actualPrice;
            existingData.totalSalesPrice += salesPrice;
        }

      
        let discountAmount = (salesPrice * discountPercentage) / 100;

        let profit = salesPrice - actualPrice - discountAmount;

       
        existingData.discount += discountAmount;
        existingData.profit += profit;

        await existingData.save(); 

        res.json({ success: true, updatedData: existingData });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/getPriceDetails", userAuthrization, async (req, res) => {
    try {
        const priceDetails = await DashboardSales.findOne();

        if (!priceDetails) {
            return res.json({ 
                totalActualPrice: 0, 
                totalSalesPrice: 0, 
                discount: 0, 
                profit: 0 
            });
        }

        res.json(priceDetails);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/dashboard', userAuthrization, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;

