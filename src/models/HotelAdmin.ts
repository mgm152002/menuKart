import mongoose from 'mongoose';
import Order from './Order';
import Menu from './Menu';

const hotelAdminSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^[6-9]{1}[0-9]{9}$/.test(v);
      },
      message: 'Invalid Indian phone number!',
    },
  },
  password: {
    type: String,
    required: true,
  },
  currentOrders: [
    {
      order: [Order.schema],
      status: String,
      paymentstatus: String,
      customer: String,
    },
  ],
  completedOrders: [
    {
      order: [Order.schema],
      status: String,
      paymentstatus: String,
      customer: String,
    },
  ],
  hotelMenu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
});

const HotelAdmin = mongoose.models.HotelAdmin || mongoose.model('HotelAdmin', hotelAdminSchema);

export default HotelAdmin;