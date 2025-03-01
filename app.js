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
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./routes/usuario');
const passport = require('passport');
require("./config/auth")(passport)
// Configuracoes
//Sessao
app.use(session({
  secret: "cursodenode",
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  next();
})
// Body Paser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
//Mongoose
mongoose.connect("mongodb://localhost/blogapp").then(() => {
  console.log("Conectado ao mongo")
}).catch((err) => {
  console.log("Erro ao se conectar" + err)
})
//Public
app.use(express.static(path.join(__dirname, "public")))
// Rotas
app.get('/', (req, res) => {
  Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
    res.render("index", { postagens: postagens })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno")
    res.redirect("/404")
  })
})

app.get("/404", (req, res) => {
  res.send("Erro 404!")
})

app.get("/posts", (req, res) => {
  res.send("Lista de Posts")
})

app.get("/categorias", (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render("categorias/index", { categorias: categorias })
  }).catch((err) => {
    req.flash("error_msg", "Houve um errro interno ao listar as categorias")
    res.redirect("/")
  })
})

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
    if (Categoria) {

      Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
        res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
      })

    } else {
      req.flash("error_msg", "Esta categoria nao existe")
      res.redirect("/")
    }
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria")
    res.redirect("/")
  })
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)
// Outros
const PORT = 8081
app.listen(PORT, () => {
  console.log('Servidor rodando! ')
})