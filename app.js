// 1. Import required modules
const express = require("express");
const session = require("express-session"); // For session management
const passport = require("passport"); // Main passport library
const LocalStrategy = require("passport-local").Strategy; // Local strategy for username/password
const bcrypt = require("bcryptjs"); // For password hashing
const { pool } = require("./storage/pool.js"); // Your DB connection

const app = express();

// 2. Middleware to parse JSON bodies
app.use(express.json());
const { signUp}=require("./actions")
app.post("/signup",signUp)

// 3. Set up session middleware (required for persistent login sessions)
app.use(session({
  secret: "your_secret_key", // Change this to a strong secret in production!
  resave: false,
  saveUninitialized: false
}));

// 4. Initialize Passport and use session
app.use(passport.initialize());
app.use(passport.session());

// 5. Configure Passport's local strategy
passport.use(new LocalStrategy(
  { usernameField: "email" }, // Use "email" instead of default "username"
  async (email, password, done) => {
    try {
      // 5a. Find the user in the database by email
      const result = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) {
        // 5b. If user not found, authentication fails
        return done(null, false, { message: "Incorrect email." });
      }
      // 5c. Compare the provided password with the hashed password in DB
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // 5d. If password does not match, authentication fails
        return done(null, false, { message: "Incorrect password." });
      }
      // 5e. If everything is OK, return the user object
      return done(null, user);
    } catch (err) {
      // 5f. Handle errors
      return done(err);
    }
  }
));

// 6. Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only user ID in session
});

// 7. Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM "Users" WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user); // Attach user object to req.user
  } catch (err) {
    done(err);
  }
});

// 8. Login route
app.get("/",(req,res)=>{
  res.render(__dirname+"/views/app.ejs")
})
app.post("/login", passport.authenticate("local"), (req, res) => {
  // If authentication succeeds, this handler runs
  res.json({ message: "Logged in successfully!", user: req.user });
  alert(res.message)
});

// 9. Protected route example
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    // Only allow access if logged in
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ user: req.user });
});

// 10. Logout route
app.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully!" });
  });
});


// 11. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
