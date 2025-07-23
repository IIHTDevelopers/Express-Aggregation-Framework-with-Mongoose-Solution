const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// POST route to create a new hotel
router.post('/hotels', hotelController.createHotel);

// GET route to fetch all hotels
router.get('/hotels', hotelController.getAllHotels);

// POST route to create a new review
router.post('/reviews', hotelController.createReview);

// GET route to get aggregated report (average price per location)
router.get('/hotels/aggregated', hotelController.aggregatedReport);

// GET route to get hotel with reviews
router.get('/hotels/:id/reviews', hotelController.hotelWithReviews);

module.exports = router;
