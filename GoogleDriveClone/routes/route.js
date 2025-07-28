import passport from "passport";
import express from "express";
import localStrategy from "passport-local";
import { pool } from "../../membersOnly/storage/pool.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import session from 'express-session';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { login,upload } from "../controllers/auth.js";


const app=express();

// Set up session middleware FIRST
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Then set up Passport
app.use(passport.initialize());
app.use(passport.session());

// Other middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
// optional - defaults to './views'

app.get("/",(req,res)=>{
    res.render("login");
})
app.post("/login",login);
app.post("/upload",upload)

app.listen(3000,()=>{
    console.log("server is running on port 3000");
})