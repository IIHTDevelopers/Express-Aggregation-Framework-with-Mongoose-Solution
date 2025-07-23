const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    rooms: { type: Number, required: true },
}, { timestamps: true });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
