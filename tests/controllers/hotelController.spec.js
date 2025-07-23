const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');  // Your Express app
const Hotel = require('../../models/hotel');  // Hotel model
const Review = require('../../models/review');  // Review model
const hotelController = require('../../controllers/hotelController'); // Path to your controller file

let mongoServer;
let createdHotelId;

beforeAll(async () => {
    // Start an in-memory MongoDB server before tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a hotel and save its ID for later use in review-related test cases
    const hotelData = {
        name: 'Sunset Resort',
        location: 'California',
        price: 200,
        rooms: 50
    };
    const createdHotel = await request(app).post('/api/hotels').send(hotelData);
    createdHotelId = createdHotel.body._id;  // Save the hotel ID for use in other tests
});

afterAll(async () => {
    // Close the in-memory MongoDB server after tests
    await mongoose.disconnect();
    await mongoServer.stop();
});

let hotelControllerBoundaryTest = `HotelController boundary test`;

describe('Hotel Controller', () => {
    describe('boundary', () => {

        // Test case for creating a hotel (POST /api/hotels)
        it(`${hotelControllerBoundaryTest} should create a new hotel when all required fields are provided`, async () => {
            const hotelData = {
                name: 'Sunset Resort',
                location: 'California',
                price: 200,
                rooms: 50
            };

            const response = await request(app)
                .post('/api/hotels')
                .send(hotelData);

            expect(response.status).toBe(201);  // Status 201 for created
            expect(response.body.message).toBe('Hotel successfully added!');
            createdHotelId = response.body._id;  // Save the ID for future use
        });

        // Test case for creating a hotel with missing fields
        it(`${hotelControllerBoundaryTest} should return an error if required fields are missing`, async () => {
            const hotelData = {
                name: 'Ocean View Resort',
                location: 'Hawaii'
                // Missing price and rooms
            };

            const response = await request(app)
                .post('/api/hotels')
                .send(hotelData);

            expect(response.status).toBe(400);  // Status 400 for bad request
            expect(response.body.message).toContain('All fields are required');
        });

        // Test case for creating a hotel with empty strings
        it(`${hotelControllerBoundaryTest} should return an error if name or location is an empty string`, async () => {
            const hotelData = {
                name: '',
                location: 'California',
                price: 200,
                rooms: 50
            };

            const response = await request(app)
                .post('/api/hotels')
                .send(hotelData);

            expect(response.status).toBe(400);  // Status 400 for bad request
            expect(response.body.message).toContain('All fields are required');
        });

        // Test case for getting all hotels with pagination, filtering, and sorting (GET /api/hotels)
        it(`${hotelControllerBoundaryTest} should get hotels with pagination, filtering, and sorting`, async () => {
            // Create multiple hotels for testing
            await request(app).post('/api/hotels').send({
                name: 'Beach Resort',
                location: 'California',
                price: 100,
                rooms: 20
            });

            await request(app).post('/api/hotels').send({
                name: 'Mountain Lodge',
                location: 'Switzerland',
                price: 150,
                rooms: 30
            });

            const response = await request(app)
                .get('/api/hotels?page=1&limit=2&sort=price')
                .query({ location: 'California', price: '50,150', rooms: '20,30' });

            expect(response.status).toBe(200);  // Status 200 for successful GET
            expect(Array.isArray(response.body)).toBe(true);  // Should return an array of hotels
        });

        it(`${hotelControllerBoundaryTest} should use $match, $lookup, $addFields, and $project in the aggregation pipeline in hotelWithReviews`, () => {
            // Get the function definition
            const functionBody = hotelController.hotelWithReviews.toString();

            // Check if each aggregation stage is used in the function
            expect(functionBody).toContain('$match');
            expect(functionBody).toContain('$lookup');
            expect(functionBody).toContain('$addFields');
            expect(functionBody).toContain('$project');
        });

        it(`${hotelControllerBoundaryTest} should use $group and $sort in the aggregation pipeline in aggregatedReport`, () => {
            // Get the function definition
            const functionBody = hotelController.aggregatedReport.toString();

            // Check if each aggregation stage is used in the function
            expect(functionBody).toContain('$group');
            expect(functionBody).toContain('$sort');
        });
    });
});
