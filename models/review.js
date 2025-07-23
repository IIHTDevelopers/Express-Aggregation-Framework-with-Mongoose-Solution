const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    rating: { type: Number, required: true },
    comment: { type: String },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
