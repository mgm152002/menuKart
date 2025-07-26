import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  itemname: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;