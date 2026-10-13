import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },
    readTime: { type: String, default: "4 min read" }
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);

