import express from "express";
import cors from "cors";
import { getBlogs, createBlog, deleteBlog, updateBlog } from './controllers/actions.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

// Routes
app.get('/blogs', getBlogs);
app.post('/blogs', createBlog);
app.delete('/blogs/:id', deleteBlog);
app.put('/blogs/:id', updateBlog);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});