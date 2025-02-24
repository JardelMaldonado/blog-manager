// Carregando modulos
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser')
const app = express()
const path = require('path');
const admin = require('./routes/admin')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
// Configuracoes
//Sessao
app.use(session({
   secret: "cursodenode",
   resave: true,
   saveUninitialized: true
}))
app.use(flash())
//Middleware
app.use((req, res, next) => {
     res.locals.success_msg = req.flash("success_msg")
     res.locals.error_msg = req.flash("error_msg")
     next();
})
// Body Paser
app.use(express.urlencoded({extended: true}))
app.use(express.json())
// Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views','layouts')
  }));
  app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
//Mongoose
  mongoose.connect("mongodb://localhost/blogapp").then(() =>{
    console.log("Conectado ao mongo")
  }).catch((err) =>{
    console.log("Erro ao se conectar" +err)
  })
  //Public
     app.use(express.static(path.join(__dirname,"public")))
// Rotas
app.use('/admin', admin)
// Outros
const PORT = 8081 
app.listen(PORT,() => {
    console.log('Servidor rodando! ')
})