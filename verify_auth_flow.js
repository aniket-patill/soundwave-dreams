import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:3001/api';
const LOG_FILE = 'verify_result.txt';

try { fs.unlinkSync(LOG_FILE); } catch (e) { }

function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + '\n');
    console.log(msg);
}

async function verifyAuth() {
    const testUser = {
        email: 'shridhar@gmail.com',
        password: 'shridhar1234'
    };

    log(`1. Attempting to Login as: ${testUser.email}`);
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);

        if (loginRes.data.token) {
            log('✅ Login Successful! Token received.');
            const token = loginRes.data.token;

            log('2. Attempting to Fetch Songs...');
            const songsRes = await axios.get(`${API_URL}/songs?limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            log(`✅ Fetch Songs Successful! Got ${songsRes.data.songs?.length || 0} songs.`);
            if (songsRes.data.songs?.length > 0) {
                log(`First Song Audio URL: ${songsRes.data.songs[0].audioUrl}`);
            }
        } else {
            log('❌ Login failed: No token returned.');
        }

    } catch (error) {
        log(`❌ Auth Flow Failed: ${error.message}`);
        if (error.response) {
            log(`Error Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

verifyAuth();
