if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://jardel:ALb@24422@app-blog.aom19.mongodb.net/?retryWrites=true&w=majority&appName=app-blog"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}