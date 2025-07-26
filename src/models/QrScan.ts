import mongoose from 'mongoose';

const qrScanSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelAdmin',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  deviceType: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
});

const QrScan = mongoose.models.QrScan || mongoose.model('QrScan', qrScanSchema);

export default QrScan;
