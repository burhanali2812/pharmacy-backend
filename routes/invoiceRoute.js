import express from 'express';
import userAuthrization from '../middleware/authMiddleWare.js';
import Invoices from '../models/Invoices.js';

const router = express.Router();
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
  router.get("/sales/today", async (req, res) => {
      try {
          const today = new Date();
          today.setHours(0, 0, 0, 0); 
  
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1); 
  
          const sales = await Invoices.aggregate([
              {
                  $match: {
                      createdAt: { $gte: today, $lt: tomorrow } 
                  }
              },
              {
                  $group: {
                      _id: null, 
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

export default router;