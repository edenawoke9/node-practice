import passport from "passport";
import express from "express";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from '@prisma/client';
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

// Fixed LocalStrategy with Prisma
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email }
      });
      
      if (!user) {
        return done(null, false, { message: "user not found" });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "invalid password" });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export async function login(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.render("index", { user: user });
    });
  })(req, res, next);
}

export async function upload(req, res, next) {
    try {
        const file = await prisma.file.create({
            data: {
                url: req.body.url
            }
        });
        
        console.log("file uploaded successfully:", file);
        res.json({ message: "File uploaded successfully", file });
        
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
}