import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import '../models/Usuario.js';

const Usuario = mongoose.model("usuarios");
const router = express.Router();

const JWT_SECRET = 'sua_chave_secreta_segura';

router.get("/registro", (req, res) => {
  res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
  const erros = [];

  if (!req.body.nome) {
    erros.push({ texto: "Nome inválido" });
  }
  if (!req.body.email) {
    erros.push({ texto: "E-mail inválido" });
  }
  if (!req.body.senha) {
    erros.push({ texto: "Senha inválida" });
  }
  if (req.body.senha && req.body.senha.length < 4) {
    erros.push({ texto: "Senha muito curta" });
  }
  if (req.body.senha !== req.body.senha2) {
    erros.push({ texto: "As senhas são diferentes, tente novamente!" });
  }

  if (erros.length > 0) {
    res.render("usuarios/registro", { erros });
  } else {
    Usuario.findOne({ email: req.body.email })
      .then((usuario) => {
        if (usuario) {
          req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema");
          res.redirect("/usuarios/registro");
        } else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
          });

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                res.redirect("/");
              }

              novoUsuario.senha = hash;

              novoUsuario
                .save()
                .then(() => {
                  req.flash("success_msg", "Usuário criado com sucesso!");
                  res.redirect("/");
                })
                .catch(() => {
                  req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente");
                  res.redirect("/usuarios/registro");
                });
            });
          });
        }
      })
      .catch(() => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
      });
  }
});

router.get("/login", (req, res) => {
  res.render("usuarios/login");
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await Usuario.findOne({ email });
    if (!user) {
      req.flash("error_msg", "Usuário não encontrado");
      return res.redirect("/usuarios/login");
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      req.flash("error_msg", "Senha incorreta");
      return res.redirect("/usuarios/login");
    }

    const token = jwt.sign(
      { id: user._id, nome: user.nome },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // colocar true em produção com HTTPS
      maxAge: 3600000 // 1h
    });

    req.flash("success_msg", "Login realizado com sucesso!");
    res.redirect("/admin"); // ou onde for sua área protegida

  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro interno no login");
    res.redirect("/usuarios/login");
  }
});

// LOGOUT (remove cookie)
router.get("/logout", (req, res) => {
  res.clearCookie('token');
  req.flash("success_msg", "Deslogado com sucesso");
  res.redirect("/");
});

export default router;
