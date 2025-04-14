import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta_segura'; // use dotenv em produção

export function eAdmin(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error_msg", "Você precisa estar logado!");
    return res.redirect("/usuarios/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    if (decoded.eAdmin) {
      return next();
    } else {
      req.flash("error_msg", "Você precisa ser um Admin!");
      return res.redirect("/");
    }
  } catch (err) {
    req.flash("error_msg", "Sessão inválida, faça login novamente.");
    return res.redirect("/usuarios/login");
  }
}

