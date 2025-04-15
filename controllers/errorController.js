const httpStatus = require("http-status-codes");
exports.pageNotFoundError = (req, res) => {
let errorCode = httpStatus.NOT_FOUND;
res.status(errorCode);
res.render("error", {
pageTitle: "Erreur 404",
errorCode: errorCode,
message: "La page demandée n'existe pas"
});
};
exports.internalServerError = (error, req, res, next) => {
let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
console.log(`Erreur: ${error.stack}`);
res.status(errorCode);
res.render("error", {
pageTitle: "Erreur 500",
errorCode: errorCode,
message: "Erreur interne du serveur"
});
};