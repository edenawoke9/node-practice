import  express from "express";
import { Prisma } from "@prisma/client";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from '@prisma/client';
import session from "express-session";

const app=express()
const prisma = new PrismaClient(); // Not prisma()
passport.initialize()
passport.session()
passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email }
            });
            
            if (!user) {
                return done(null, false);
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false);
            }
            
            return done(null, user, { message: "user found" });
        } catch (error) {
            return done(error);
        }
    }
));
passport.serializeUser((user,done)=>{
    return done(null,user)
})
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
        return done(null, user);
    } catch (error) {
        return done(error);
    }
});

async function Login(req, res, next) {
    passport.authenticate("local", (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Authentication error" });
        }
        if (!user) {
            console.log("user not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        req.login(user, (err) => {
            if (err) {
                return res.status(400).json({
                    message: "log in unsuccessful"
                });
            }
            res.status(200).json({
                user: user,
                message: "logged in successful"
            });
        });
    })(req, res, next);
}
async function createBlog(req,res){
    const blog= await prisma.blog.create({
        data: req.body
    })
    if (!blog){
        res.status(400).json({
            message: "not created"
        })
    }
    else{
        res.status(201).json({
            message: "created"
        })
    }
}
async function getBlogs(req, res) {
    try {
        const blogs = await prisma.blog.findMany();
        
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({
                message: "no blogs found"
            });
        }
        
        res.status(200).json(blogs); // Fixed typo: stauts -> status
        
    } catch (error) {
        console.error("Get blogs error:", error);
        res.status(500).json({
            message: "Failed to fetch blogs",
            error: error.message
        });
    }
}
async function deleteBlog(req, res) {
    try {
        const { id } = req.params; // Get blog ID from URL parameters
        
        const blog = await prisma.blog.delete({
            where: {
                id: parseInt(id)
            }
        });
        
        res.status(200).json({
            message: "Blog deleted successfully",
            blog: blog
        });
        
    } catch (error) {
        console.error("Delete error:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                message: "Blog not found"
            });
        }
        res.status(500).json({
            message: "Failed to delete blog",
            error: error.message
        });
    }
}

// Update blog function
async function updateBlog(req, res) {
    try {
        const { id } = req.params; // Get blog ID from URL parameters
        const updateData = req.body; // Get update data from request body
        
        const blog = await prisma.blog.update({
            where: {
                id: parseInt(id)
            },
            data: updateData
        });
        
        res.status(200).json({
            message: "Blog updated successfully",
            blog: blog
        });
        
    } catch (error) {
        console.error("Update error:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                message: "Blog not found"
            });
        }
        res.status(500).json({
            message: "Failed to update blog",
            error: error.message
        });
    }
}

// Partial update function (update only specific fields)
async function patchBlog(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const blog = await prisma.blog.update({
            where: {
                id: parseInt(id)
            },
            data: updateData
        });
        
        res.status(200).json({
            message: "Blog updated successfully",
            blog: blog
        });
        
    } catch (error) {
        console.error("Patch error:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                message: "Blog not found"
            });
        }
        res.status(500).json({
            message: "Failed to update blog",
            error: error.message
        });
    }
}

export {
    Login,
    createBlog,
    getBlogs,
    deleteBlog,
    updateBlog,
    patchBlog
};