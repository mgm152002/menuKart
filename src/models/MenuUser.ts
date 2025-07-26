import mongoose from 'mongoose';
import Order from './Order';

const menuUserSchema = new mongoose.Schema({
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
  tableno: Number,
  cart: [Order.schema],
});

const MenuUser = mongoose.models.MenuUser || mongoose.model('MenuUser', menuUserSchema);

export default MenuUser;
