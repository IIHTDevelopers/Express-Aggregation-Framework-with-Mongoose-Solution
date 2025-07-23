const mongoose = require('mongoose');
const Hotel = require('../models/hotel');
const Review = require('../models/review');

// POST route to add a new hotel
const createHotel = async (req, res) => {
    try {
        const { name, location, price, rooms } = req.body;

        // Validate that all fields are provided
        if (!name || !location || !price || !rooms) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hotel = new Hotel({
            name,
            location,
            price,
            rooms
        });

        await hotel.save();
        res.status(201).json({ message: 'Hotel successfully added!', hotel }); // Success message
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
};

// Get all hotels with filtering, sorting, and aggregation options
const getAllHotels = async (req, res) => {
    try {
        // Get hotels from DB
        const hotels = await Hotel.find();

        res.status(200).json(hotels);  // Return the hotels as the response
    } catch (err) {
        res.status(500).json({ error: err.message });  // Handle errors
    }
};

// POST route to add a new review
const createReview = async (req, res) => {
    try {
        const { hotelId, rating, comment } = req.body;
        console.log(hotelId, rating, comment);
        

        if (String(hotelId).length === 0 && String(rating).length === 0 && String(comment).length === 0) {
            return res.status(400).json({ message: 'Hotel ID, rating, and comment are required' });
        }

        // Check if hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const review = new Review({
            hotelId,
            rating,
            comment
        });

        await review.save();
        res.status(201).json({ message: 'Review successfully added!', review }); // Success message
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors
    }
};

// Example of Aggregated Report: Average Price per Location
const aggregatedReport = async (req, res) => {
    try {
        const aggregationPipeline = [
            { $group: { _id: "$location", averagePrice: { $avg: "$price" } } },
            { $sort: { averagePrice: 1 } } // Sort by average price
        ];

        const report = await Hotel.aggregate(aggregationPipeline);
        res.status(200).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Example of joining Hotels with Reviews using $lookup and calculating average rating
const hotelWithReviews = async (req, res) => {
    try {
        const hotelId = req.params.id;

        const pipeline = [
            {
                $match: { _id: mongoose.Types.ObjectId(hotelId) }  // Match the hotel by ID
            },
            {
                $lookup: {
                    from: 'reviews',   // The collection to join with
                    localField: '_id',  // Field in Hotel to match with Review
                    foreignField: 'hotelId', // Field in Review to match with Hotel
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    averageRating: { $avg: "$reviews.rating" }  // Add average rating based on reviews
                }
            },
            {
                $project: {
                    name: 1,
                    location: 1,
                    price: 1,
                    rooms: 1,
                    reviews: 1,  // Include the reviews array
                    averageRating: 1  // Include the average rating
                }
            }
        ];

        const hotelData = await Hotel.aggregate(pipeline);
        res.status(200).json(hotelData);  // Return the hotel data with reviews and average rating
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createHotel, getAllHotels, createReview, aggregatedReport, hotelWithReviews };
