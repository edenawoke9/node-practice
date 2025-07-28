import express from "express";
import { hash } from "bcryptjs";
import { body, validationResult } from "express-validator";
import { pool } from "../../membersOnly/storage/pool.js";
const app=express()



app.use(express.json());


export async function signUp(req, res) {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
     // 2. Extract data from the request body (not query)
    const { firstname, email, password, status } = req.body;
    console.log(firstname, email, password, status)

    try {
      
        if (!password) {
            return res.status(400).json({ message: "Password is required." });
        }
        const hashedPassword = await hash(password, 10);

        const query = `
            INSERT INTO "Users" (firstname, email, password, status) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email;
        `;
        const values = [firstname, email, hashedPassword, status || true];

        const result = await pool.query(query, values);

        
        res.status(201).json({
            message: "User created successfully!",
            user: result.rows[0]
        });
        console.log(res.message)
    } catch (err) {
        
        console.error(err);
        if (err.code === '23505') { 
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// export const validationRules = [
//     body('firstname').notEmpty().trim().escape().withMessage('First name is required.'),
//     body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email.'),
//     body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
// ];




