import express from "express";
import { createBlog, getBlogs, deleteBlog, updateBlog, patchBlog } from "../controllers/actions.js";

const router=express.Router();

router.get("/blogs",getBlogs);
router.post("/create",createBlog);
router.delete("/delete/:id",deleteBlog);
router.put("/update",updateBlog);
router.patch("/patch",patchBlog);

export default router;