const mongoURI =
  process.env.NODE_ENV === "production"
    ? "mongodb+srv://jardel:ALb@24422@app-blog.aom19.mongodb.net/?retryWrites=true&w=majority&appName=app-blog"
    : "mongodb://localhost/blogapp";

export { mongoURI };
