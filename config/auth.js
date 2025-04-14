import { Strategy as LocalStrategy } from "passport-local";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta_segura'; // ideal usar dotenv

export default function authJWT(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error_msg", "Você precisa estar logado para acessar essa página");
    return res.redirect("/usuarios/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.flash("error_msg", "Sessão inválida, faça login novamente");
    res.redirect("/usuarios/login");
  }
}

