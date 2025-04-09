export function eAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.eAdmin) {
        return next();
    }

    req.flash("error_msg", "Você precisa ser um Admin!");
    res.redirect("/");
}
