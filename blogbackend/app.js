import express from "express";
import cors from "cors";
import router from "./routes/route.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

// Routes
app.use("/",router);
app.listen(3000, () => {
    console.log('Server running on port 3000');
});