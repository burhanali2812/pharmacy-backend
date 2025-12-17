import express from 'express';
import Supplier from '../models/Supplier.js';
import SupplierMedicine from '../models/SupplierMedicine.js';
import userAuthrization from '../middleware/authMiddleWare.js';


const router = express.Router();

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
router.get('/get-supplier-medicine', userAuthrization, async (req, res) => {
    const medicines = await SupplierMedicine.find();
    res.json(medicines);
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

       return res.json({ message: "Supplier and associated medicines deleted successfully!" });
  


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
       return res.status(500).json({ error: "Server error" });
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

export default router;