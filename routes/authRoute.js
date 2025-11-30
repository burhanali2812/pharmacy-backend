const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Medicine = require('../models/Medicine');
const Invoices = require('../models/Invoices');
const Supplier = require('../models/Supplier');
const DashboardSales = require('../models/DashboardSales');
const SupplierMedicine = require('../models/SupplierMedicine');
const userAuthrization = require('../middleware/authMiddleWare')

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
router.get('/get-user',userAuthrization, async (req, res) => {
    try {
      
        const user = await User.find();
        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
router.delete('/delete-user/:id',userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;  
        
        const user = await User.findByIdAndDelete(id); 
        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }
        
        res.json({ message: "Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
router.put('/update-user/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, email } = req.body;

        const checkUser = await User.findById(id);
        if (!checkUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (email && email !== checkUser.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email Already Registered!" });
            }
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, contact },  
            { new: true }
        );

        res.json({ message: "User updated!", checkUser: updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
router.put('/update-user-role/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const { role} = req.body;

        const checkUser = await User.findById(id);
        if (!checkUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },  
            { new: true }
        );

        res.json({ message: "User updated!", checkUser: updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put("/reset-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});



router.get('/dashboard', userAuthrization, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/add-Medicine', userAuthrization, async (req, res) => {
    try {
        const { sID, name, quantity, price, expire, prescription, actualPrice, profit, supplier } = req.body;
        const exist = await Medicine.findOne({ sID });
        if (exist) {
            return res.status(400).json({ message: "This Medicine Already present Please Update it" });
        }
        const newMedicine = new Medicine({ sID, name, quantity, price, expire: expire.toString(), prescription, actualPrice, profit, supplier });
        await newMedicine.save();
        res.json({ message: "Medicine added!", data: newMedicine });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post('/add-supplier-Medicine', userAuthrization, async (req, res) => {
    try {
        const { sID, name, quantity, price, expire, prescription, actualPrice, profit, supplier } = req.body;
        const exist = await SupplierMedicine.findOne({ sID });
        if (exist) {
            return res.status(400).json({ message: "This Medicine Already present Please Update it" });
        }
        const newMedicine = new SupplierMedicine({ sID, name, quantity, price, expire: expire.toString(), prescription, actualPrice, profit, supplier });
        await newMedicine.save();
        res.json({ message: "Medicine added!", data: newMedicine });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/get-medicine', userAuthrization, async (req, res) => {
    const medicines = await Medicine.find();
    res.json(medicines);
});
router.get('/get-supplier-medicine', userAuthrization, async (req, res) => {
    const medicines = await SupplierMedicine.find();
    res.json(medicines);
});
router.put('/update-medicine/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const { sID, name, quantity, price, expire, supplier } = req.body;


        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found!" });
        }


        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id,
            { sID, name, quantity, price, expire, supplier },
            { new: true }
        );

        res.json({ message: "Medicine updated!", medicine: updatedMedicine });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put('/update-supplier-medicine/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const { newQuantity } = req.body;


        const medicine = await SupplierMedicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found!" });
        }


        const updatedMedicine = await SupplierMedicine.findByIdAndUpdate(
            id,
            { quantity: newQuantity },
            { new: true }
        );

        res.json({ message: "Medicine updated!", medicine: updatedMedicine });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete('/delete-medicine/:id', userAuthrization, async (req, res) => {
    try {
        let id = req.params.id.trim();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ObjectId format" });
        }

        const deletedMedicine = await Medicine.findByIdAndDelete(id);

        if (!deletedMedicine) {
            return res.status(404).json({ error: "Medicine not found" });
        }

        res.json({ message: "Medicine deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});
router.delete('/delete-all-medicines', userAuthrization, async (req, res) => {
    try {
        const deletedMedicines = await Medicine.deleteMany({}); // Deletes all documents

        if (deletedMedicines.deletedCount === 0) {
            return res.status(404).json({ error: "No medicines found to delete" });
        }

        res.json({ message: "All medicines deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/add-invoice', userAuthrization, async (req, res) => {
    try {
        const { invoiceNumber, medicines, grandTotal, discount, total } = req.body;
        const newInvoice = new Invoices({ invoiceNumber, medicines, grandTotal, discount, total });
        await newInvoice.save();
        res.json({ message: "Invoive Added Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})
router.delete('/delete-invoice/:id', userAuthrization, async (req, res) => {
    try {
        let id = req.params.id.trim();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ObjectId format" });
        }

        const deleteInvoice = await Invoices.findByIdAndDelete(id);
        if (!deleteInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.json({ message: "Invoice deleted successfully" });
    } catch (error) {

        res.status(500).json({ error: "Server error" });

    }
});

router.get('/get-invoice', userAuthrization, async (req, res) => {
    const invoices = await Invoices.find().sort({ createdAt: -1 });
    res.json(invoices)
})
router.get('/get-invoice/:id', userAuthrization, async (req, res) => {
    try {
        const invoiceId = req.params.id.trim();
        const invoice = await Invoices.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(invoice);
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.get("/sales/today", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to start of the day

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Get the start of the next day

        const sales = await Invoices.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow } // Get only today's data
                }
            },
            {
                $group: {
                    _id: null, // No need to group by date, since we're fetching only today
                    totalSales: { $sum: "$grandTotal" }
                }
            }
        ]);

        console.log("Today's Sales Data from MongoDB:", sales);
        const totalSales = sales.length > 0 ? sales[0].totalSales : 0;

        res.json({ todaySales: totalSales });
    } catch (error) {
        console.error("Error fetching today's sales data:", error);
        res.status(500).json({ error: "Failed to fetch today's sales data" });
    }
});


router.post('/add-supplier', userAuthrization, async (req, res) => {
    try {
        const { licenseNumber, name, address, contact } = req.body;
        const existing = await Supplier.findOne({ licenseNumber });
        if (existing) {
            return res.status(400).json({ message: "This License Number Already Registered" })
        }
        const newSupplier = new Supplier({ licenseNumber, name, address, contact });
        await newSupplier.save();
        res.json({ message: "Supplier Added Successfully" });
    } catch (error) {
        console.error("Error fetching Supplier:", error);
        res.status(500).json({ error: "Failed to Add Supplier" });
    }
});
router.get('/get-supplier', userAuthrization, async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ joinedAt: -1 });
        res.json(suppliers);

    } catch (error) {
        console.error("Error getting Supplier:", error);
        res.status(500).json({ error: "Failed to get Supplier" });
    }
});
router.get('/get-supplier/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const suppliers = await Supplier.findById(id);
        res.json(suppliers);

    } catch (error) {
        console.error("Error getting Supplier:", error);
        res.status(500).json({ error: "Failed to get Supplier" });
    }
});
router.put('/update-supplier/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const { licenseNumber, name,contact, medicineQuantity, totalCost, paidAmount,address } = req.body;


        const checkSupplier = await Supplier.findById(id);
        if (!checkSupplier) {
            return res.status(404).json({ message: "supplier not found!" });
        }


        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id,
            { licenseNumber, name,contact, medicineQuantity, totalCost, paidAmount,address },
            { new: true }
        );

        res.json({ message: "Supplier updated!", checkSupplier: updatedSupplier });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put('/delete-supplier/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSupplier = await Supplier.findByIdAndUpdate(id, { isPast: true }, { new: true });
        if (!updatedSupplier) {
            return res.status(404).json({ error: "Supplier  not found" });
        }
        res.json({ message: "Supplier marked as past!", supplier: updatedSupplier });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.delete('/delete-permanent-supplier/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;

        const suppliers = await Supplier.findById(id);
        if (!suppliers) {
            return res.status(404).json({ error: "Supplier not found" });
        }

        const supplierName = suppliers.supplier;

        await SupplierMedicine.deleteMany({ supplierName });


        await Supplier.findByIdAndDelete(id);

        res.json({ message: "Supplier and associated medicines deleted successfully!" });
        console.log("Supplier and associated medicines deleted successfully!");


    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


router.put('/recover-supplier/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSupplier = await Supplier.findByIdAndUpdate(id, { isPast: false }, { new: true });
        if (!updatedSupplier) {
            return res.status(404).json({ error: "Supplier  not found" });
        }
        res.json({ message: "Supplier marked as past!", supplier: updatedSupplier });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.put('/update-quantity/:id', userAuthrization, async (req, res) => {
    try {
        const { id } = req.params;
        const { additionalQuantity, totalPrice } = req.body;

        if (!additionalQuantity || isNaN(additionalQuantity)) {
            return res.status(400).json({ error: "Invalid quantity" });
        }
        if (!totalPrice || isNaN(totalPrice)) {
            return res.status(400).json({ error: "Invalid Total Price" });
        }

        // Find the supplier first
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        supplier.totalCost = parseInt(totalPrice);
        supplier.medicineQuantity = parseInt(additionalQuantity);

        const updatedSupplier = await supplier.save();

        res.json({ message: "Quantity Updated", updatedSupplier });

    } catch (error) {
        res.status(500).json({ error: "Server error", message: error.message });
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
router.get("/getPriceDetails", async (req, res) => {
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
router.delete("/deletePriceDetails", async (req, res) => {
    try {
        const priceDetails = await DashboardSales.deleteMany();

       res.json({message: "deleted Successfully"})
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/monthly-sales", userAuthrization, async (req, res) => {
    try {
      const invoices = await Invoices.find();

      let monthlySales = Array(12).fill(0);
      let totalSales = 0;
  
      invoices.forEach((invoice) => {
        const month = new Date(invoice.createdAt).getMonth(); 
        monthlySales[month] += invoice.total; 
        totalSales += invoice.total; 
      });
  
      res.status(200).json({ monthlySales, totalSales });
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  
  router.put("/change-password/:id", userAuthrization, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

     
        const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isMatchPassword) return res.status(400).json({ message: "Old password is incorrect" });

   
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

       
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});



module.exports = router;

