require('dotenv').config();  

const express = require('express');
const passport = require('passport');
const session = require('express-session');  
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const app = express();


app.use(session({
  secret: 'your_secret_key',  
  resave: false,              
  saveUninitialized: true,    
  cookie: { 
    secure: false,            
    httpOnly: true,           
    maxAge: 60000,            
  }
}));


app.use((req, res, next) => {
  console.log('Session:', req.session);  
  console.log('Session ID:', req.sessionID);  
});


app.use(passport.initialize());
app.use(passport.session());  


passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('User profile:', profile);  
    return done(null, profile);
  } catch (err) {
    return done(err);  
  }
}));


passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);  
  done(null, user);
});


passport.deserializeUser((user, done) => {
  console.log('Deserializing user:', user);  
  done(null, user);
});


app.get('/auth/linkedin', passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/resume');  
  }
);


app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});

