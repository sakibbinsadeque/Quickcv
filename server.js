require('dotenv').config();  // Load environment variables

const express = require('express');
const passport = require('passport');
const session = require('express-session');  // Import express-session
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const app = express();

// Session middleware setup with more detailed logging
app.use(session({
  secret: 'your_secret_key',  // Secret key for session encryption
  resave: false,              // Prevents unnecessary session resaving
  saveUninitialized: true,    // Allows session to be created for new users
  cookie: { 
    secure: false,            // Should be false for local HTTP testing
    httpOnly: true,           // Ensures cookies are not accessed by JavaScript
    maxAge: 60000,            // Cookie expiration time (1 minute for easy debugging)
  }
}));

// Debugging: Log the session and session ID for each request
app.use((req, res, next) => {
  console.log('Session:', req.session);  // Log session data to console
  console.log('Session ID:', req.sessionID);  // Log session ID
  next();
});

// Passport middleware setup
app.use(passport.initialize());
app.use(passport.session());  // Ensure this is **after** express-session

// Passport LinkedIn Strategy setup
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('User profile:', profile);  // Debugging: Print LinkedIn profile data
    return done(null, profile);
  } catch (err) {
    return done(err);  // Pass any error to done
  }
}));

// Serialize user data to store in the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);  // Debugging: Log serialized user
  done(null, user);
});

// Deserialize user data to retrieve from the session
passport.deserializeUser((user, done) => {
  console.log('Deserializing user:', user);  // Debugging: Log deserialized user
  done(null, user);
});

// Routes
app.get('/auth/linkedin', passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/resume');  // Redirect to resume page after successful login
  }
);

// Start the server on port 5000
app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
