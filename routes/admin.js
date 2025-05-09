import express from 'express';
const router = express.Router();

import mongoose from 'mongoose';
import '../models/Categoria.js';
import '../models/Postagem.js';

const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");

import { eAdmin } from '../helpers/eAdmin.js';
import authJWT from '../config/auth.js';



router.get('/', authJWT, (req, res) => {
    res.render("views/index");
})

router.get('/posts', authJWT, (req, res) => {
    res.send("Pagina de posts")
})

router.get('/categorias', authJWT, (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        const categoriasFormatadas = categorias.map(categoria => categoria.toObject());// Covertendo categorias para javascript puro
        res.render("admin/categorias", { categorias: categoriasFormatadas });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        req.redirect("admin")
    })
})
router.get('/categorias/add', authJWT, (req, res) => {
    res.render("admin/addcategorias")
})
router.post('/categorias/nova', authJWT, (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ text: "Nome inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (req.body.nome.length < 4) {
        erros.push({ texto: "Nome da categoria e muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente")
            res.redirect("/admin")
        })
    }
})
router.get("/categorias/edit/:id", authJWT, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })

})

router.post("/categorias/edit", authJWT, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editadda com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", authJWT, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", authJWT, (req, res) => {

    Postagem.find().lean().populate("categoria").sort({ date: "desc" }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", authJWT, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("admin")
    })
})

router.post("/postagens/nova", authJWT, (req, res) => {

    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria inválida, registre uma categoria" })
    }

    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", authJWT, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o  formulario de edição")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagem/edit", authJWT, (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro intermo")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", authJWT, (req, res) => {
    Postagem.deleteOne({ _id: req.params.id }).lean().then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem")
        res.redirect("/admin/postagens")
    })
})

export default router;
