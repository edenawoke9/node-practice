import express from "express";
import { createBlog, getBlogs, deleteBlog, updateBlog, patchBlog } from "../controllers/actions.js";

const app=express();

app.get("/blogs",getBlogs);
app.post("/create",createBlog);
app.delete("/delete",deleteBlog);
app.put("/update",updateBlog);
app.patch("/patch",patchBlog);

export default app;