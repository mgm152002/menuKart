import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelAdmin',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuUser',
    required: false, // Optional, if feedback can be anonymous
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: false, // Optional, if feedback is for the overall experience
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback;
