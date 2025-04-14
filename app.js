// Carregando módulos
import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { model, connect } from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import admin from './routes/admin.js';
import usuarios from './routes/usuario.js';
import { mongoURI } from './config/db.js';


// Recuperar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express app
const app = express();

// Carregar models
import './models/Postagem.js';
import './models/Categoria.js';
const Postagem = model("postagens");
const Categoria = model("categorias");

// Sessão
app.use(session({
  secret: "cursodenode",
  resave: true,
  saveUninitialized: true
}));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.cookies);  // Isso vai imprimir todos os cookies
  next();
});

app.use(flash());



// Middleware de mensagens flash e usuário logado
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: join(__dirname, 'views', 'layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

// Mongoose
connect(mongoURI).then(() => {
  console.log("Conectado ao MongoDB");
}).catch(err => {
  console.log("Erro ao se conectar: " + err);
});

// Public
app.use(express.static(join(__dirname, "public")));

// Rotas
app.get('/', (req, res) => {
  Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then(postagens => {
    res.render("index", { postagens });
  }).catch(err => {
    req.flash("error_msg", "Houve um erro interno");
    res.redirect("/404");
  });
});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.get("/posts", (req, res) => {
  res.send("Lista de Posts");
});

app.get("/categorias", (req, res) => {
  Categoria.find().lean().then(categorias => {
    res.render("categorias/index", { categorias });
  }).catch(err => {
    req.flash("error_msg", "Houve um erro interno ao listar as categorias");
    res.redirect("/");
  });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).lean().then(categoria => {
    if (categoria) {
      Postagem.find({ categoria: categoria._id }).lean().then(postagens => {
        res.render("categorias/postagens", { postagens, categoria });
      });
    } else {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/");
    }
  }).catch(err => {
    req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
    res.redirect("/");
  });
});

app.use('/admin', admin);
app.use('/usuarios', usuarios);

// Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});
