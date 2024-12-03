const request = require('supertest');
const app = require('./../app');

let server;

beforeAll(() => {
  server = app.listen(4000); // Start the server on a specific port
});

afterAll((done) => {
  server.close(done); // Close the server after tests
});
describe('App', () => {

    it('Should return a 404 error for a non-existent route', async () => {
        const response = await request(app).get('/non-existent-route');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', "Can't find /non-existent-route on this server!");
    });

    it('Should correctly include the requested URL in the error message', async () => {
        const testUrl = '/non-existent-route';
        const response = await request(app).get(testUrl);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', `Can't find ${testUrl} on this server!`);
    });

        it('Should set the appropriate HTTP status code to 404 for unhandled routes', async () => {
        const response = await request(app).get('/unhandled-route');
        expect(response.status).toBe(404);
    });

    it('Should handle requests with special characters in the URL', async () => {
        const specialCharUrl = '/test?param=special%20characters%20&%20symbols!@#$%^&*()';
        const response = await request(app).get(specialCharUrl);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', `Can't find ${specialCharUrl} on this server!`);
    });

    it('Should handle different HTTP methods for unhandled routes', async () => {
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        const testUrl = '/unhandled-route';

        for (const method of methods) {
            const response = await request(app)[method](testUrl);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('status', 'fail');
            expect(response.body).toHaveProperty('message', `Can't find ${testUrl} on this server!`);
        }
    });

    it('Should handle requests with query parameters correctly', async () => {
        const testUrl = '/test-route?param1=value1&param2=value2';
        const response = await request(app).get(testUrl);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', `Can't find ${testUrl} on this server!`);
    });

    it('Should work with both uppercase and lowercase URLs', async () => {
        const lowercaseUrl = '/test-route';
        const uppercaseUrl = '/TEST-ROUTE';

        const lowercaseResponse = await request(app).get(lowercaseUrl);
        const uppercaseResponse = await request(app).get(uppercaseUrl);

        expect(lowercaseResponse.status).toBe(404);
        expect(uppercaseResponse.status).toBe(404);

        expect(lowercaseResponse.body).toHaveProperty('status', 'fail');
        expect(uppercaseResponse.body).toHaveProperty('status', 'fail');

        expect(lowercaseResponse.body).toHaveProperty('message', `Can't find ${lowercaseUrl} on this server!`);
        expect(uppercaseResponse.body).toHaveProperty('message', `Can't find ${uppercaseUrl} on this server!`);
    });

    it('Should handle requests to the root path "/"', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', "Can't find / on this server!");
    });

    it('Should correctly process URLs with multiple path segments', async () => {
        const testUrl = '/api/v1/tours/123/reviews/456';
        const response = await request(app).get(testUrl);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', `Can't find ${testUrl} on this server!`);
    });

    it('Should handle requests with encoded characters in the URL', async () => {
        const encodedUrl = '/test%20route%20with%20spaces%20and%20%26%20symbols';
        const decodedUrl = decodeURIComponent(encodedUrl);
        const response = await request(app).get(encodedUrl);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message', `Can't find ${decodedUrl} on this server!`);
    });
});
