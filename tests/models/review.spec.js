const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Review = require('../../models/review');  // Path to your Review model
const Hotel = require('../../models/hotel');  // Path to your Hotel model

let mongoServer;

// Start an in-memory MongoDB server before tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Close the in-memory MongoDB server after tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

let reviewBoundaryTest = `ReviewModel boundary test`;

describe('Review Model', () => {
    describe('boundary', () => {
        let hotel;

        beforeAll(async () => {
            // Create a hotel to associate reviews with
            hotel = new Hotel({
                name: 'Sunset Resort',
                location: 'California',
                price: 200,
                rooms: 50
            });
            await hotel.save();
        });

        // Test case for creating a valid review
        it(`${reviewBoundaryTest} should create a valid review`, async () => {
            const reviewData = {
                hotelId: hotel._id, // Associating the review with the hotel
                rating: 5,
                comment: 'Amazing experience!'
            };

            const review = new Review(reviewData);
            await review.save();

            // Check if the review was created successfully
            expect(review).toHaveProperty('_id');
            expect(review.rating).toBe(reviewData.rating);
            expect(review.comment).toBe(reviewData.comment);
            expect(review.hotelId).toEqual(hotel._id);
        });

        // Test case for missing required fields (rating)
        it(`${reviewBoundaryTest} should throw an error when rating is missing`, async () => {
            const reviewData = {
                hotelId: hotel._id,
                comment: 'Nice place!'
            };

            const review = new Review(reviewData);
            try {
                await review.save();
            } catch (error) {
                expect(error.errors.rating).toBeDefined();
                expect(error.errors.rating.message).toBe('Path `rating` is required.');
            }
        });

        // Test case for creating a review without a valid hotelId
        it(`${reviewBoundaryTest} should throw an error when hotelId is invalid`, async () => {
            const reviewData = {
                hotelId: 'invalidHotelId',
                rating: 4,
                comment: 'Good stay.'
            };

            const review = new Review(reviewData);
            try {
                await review.save();
            } catch (error) {
                expect(error.errors.hotelId).toBeDefined();
                expect(error.errors.hotelId.message).toContain('Cast to ObjectId failed for value');
            }
        });

        // Test case for successfully finding a review by hotelId
        it(`${reviewBoundaryTest} should find a review by hotelId`, async () => {
            const reviewData = {
                hotelId: hotel._id,
                rating: 4,
                comment: 'Great but could be better.'
            };

            const review = new Review(reviewData);
            await review.save();

            const foundReview = await Review.findOne({ hotelId: hotel._id });
            expect(foundReview).not.toBeNull();
            expect(foundReview.hotelId.toString()).toBe(hotel._id.toString());
        });

        // Test case for deleting a review
        it(`${reviewBoundaryTest} should delete a review by id`, async () => {
            const reviewData = {
                hotelId: hotel._id,
                rating: 3,
                comment: 'It was okay.'
            };

            const review = new Review(reviewData);
            await review.save();

            const reviewId = review._id;
            await Review.findByIdAndDelete(reviewId);

            const deletedReview = await Review.findById(reviewId);
            expect(deletedReview).toBeNull();
        });
    });
});
