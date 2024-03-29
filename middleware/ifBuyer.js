const ifBuyer = (req, res, next) => {
    if (req.session.user && req.session.user.type) {
        if (req.session.user.type === "buyer") { // if buyer
            next();
        }else{
            res.redirect(`/${req.session.user.type}`);
        }
    } else {
        res.redirect('/');
    }
};

module.exports = ifBuyer;
