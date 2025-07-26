import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  itemname: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: false, // Making it optional for now, can be changed later
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  availableFrom: {
    type: String, // e.g., "09:00"
  },
  availableTo: {
    type: String, // e.g., "17:00"
  },
  daysOfWeek: [
    {
      type: String, // e.g., "Sunday", "Tuesday"
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  ],
  isSpecial: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  upsellItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
    },
  ],
});

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);

export default Menu;
