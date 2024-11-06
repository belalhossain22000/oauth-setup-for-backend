import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken"
dotenv.config();

const app = express();

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend's origin
    credentials: true, // Allow cookies/session
  })
);
// Session setup (Make sure you use a secure session store in production)
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth setup
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "143898331512-c0m6ulkhm9isq89u25qbdl7birg8po1j.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
    
      return done(null, profile);
    }
  )
);

// Serialize and deserialize the user into session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Route for initiating Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }), 
  (req, res) => {
    const token = jwt.sign(
        { displayName: req.user.displayName, email: req.user.emails[0].value, photo: req.user.photos[0].value },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );
      res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

// Start the server on port 5000
app.listen(5000, () => console.log("Server is running on port 5000"));
