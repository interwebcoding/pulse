import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
config({ path: join(__dirname, '../../.env') });

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { get, run } from '../models/database.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Auth routes will fail.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user?.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user || false);
  } catch (error) {
    done(error, false);
  }
});

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly'
      ]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = get('SELECT * FROM users WHERE id = ?', [profile.id]);
        
        if (existingUser) {
          run(`
            UPDATE users 
            SET name = ?, picture = ?
            WHERE id = ?
          `, [profile.displayName, profile.photos[0]?.value, profile.id]);
        } else {
          run(`
            INSERT INTO users (id, email, name, picture)
            VALUES (?, ?, ?, ?)
          `, [profile.id, profile.emails[0]?.value, profile.displayName, profile.photos[0]?.value]);
        }
        
        const user = get('SELECT * FROM users WHERE id = ?', [profile.id]);
        return done(null, user);
      } catch (error) {
        console.error('Error in Google strategy:', error);
        return done(error, false);
      }
    }
  ));
}

export default passport;
