import axios from 'axios';

async function testBackend() {
    const BASE_URL = 'http://localhost:3001/api';
    console.log('Testing backend at:', BASE_URL);

    try {
        // 1. Check Health (if endpoint exists)
        console.log('1. Checking Health...');
        try {
            const health = await axios.get('http://localhost:3001/healthz');
            console.log('   Health OK:', health.data);
        } catch (e) {
            console.log('   Health check failed:', e.message);
        }

        // 2. Check Playlists (will likely fail 401 but that proves server is up)
        console.log('2. Checking Playlists (expecting 401)...');
        try {
            await axios.get('http://localhost:3001/api/playlists');
        } catch (e) {
            console.log('   Playlists response:', e.message, e.response?.status); // Expect 401
        }

        // 2. Login (to get token for other requests)
        // We need a valid user. Since I can't interactive login, I'll search user routes or just skip to public endpoints if any.
        // Wait, Discover page uses /playlists?public=true. Does it require auth?
        // In playlist.routes.js: `router.use(protect);` -> YES.
        // This is a problem. The frontend needs to be logged in.
        // If the user isn't logged in, they get redirected to /login (axios interceptor).

        // 3. Songs
        // If I can't login, I can't test deeply.
        // But wait, the user said "songs not playing". They must be logged in to see them?

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testBackend();
