import express from 'express';
import ShoppingSession from '../models/ShoppingSession.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new shopping session (History Entry)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { storeId, subStoreId, storeName, items, affiliateUrl } = req.body;

    const newSession = new ShoppingSession({
      userId: req.user.id,
      storeId,
      subStoreId,
      storeName,
      itemsCount: items.length,
      itemsSnapshot: items,
      affiliateUrl,
      status: 'processing'
    });

    const savedSession = await newSession.save();
    res.status(201).json({ success: true, session: savedSession });
  } catch (error) {
    console.error("Error creating shopping session:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get user shopping history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const sessions = await ShoppingSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
