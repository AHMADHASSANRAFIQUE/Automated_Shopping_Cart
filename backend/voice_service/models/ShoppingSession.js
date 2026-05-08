import mongoose from 'mongoose';

const shoppingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeId: {
    type: String,
    required: true, // e.g., 'instacart', 'walmart'
  },
  subStoreId: {
    type: String, // e.g., 'publix', 'aldi'
    default: null
  },
  storeName: {
    type: String,
    required: true
  },
  itemsCount: {
    type: Number,
    required: true
  },
  itemsSnapshot: [{
    name: String,
    category: String,
    count: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  affiliateUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for fetching user history
shoppingSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ShoppingSession', shoppingSessionSchema);
