import userAuthrization from '../middleware/authMiddleWare.js';
import express from 'express';
import Medicine from '../models/Medicine.js';
import mongoose from 'mongoose';

const router = express.Router();



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
router.get('/get-medicine', userAuthrization, async (req, res) => {
    const medicines = await Medicine.find();
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


export default router;