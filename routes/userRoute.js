
import express from 'express';
import User from '../models/User.js';
import userAuthrization from '../middleware/authMiddleWare.js';

const router = express.Router();
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

// mark deleted dont use
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

export default router;