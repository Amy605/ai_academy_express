const User = require("../models/user");
// Fonction utilitaire pour extraire les paramètres utilisateur du corps de la requête
const getUserParams = body => {
return {
name: {
first: body.first,
last: body.last
},
email: body.email,
password: body.password,
zipCode: body.zipCode
};
};
module.exports = {
index: (req, res, next) => {

User.find({})
.then(users => {
res.locals.users = users;
next();
})
.catch(error => {
console.log(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
next(error);
});
},
indexView: (req, res) => {
res.render("users/index");
},
new: (req, res) => {
res.render("users/new");
},
create: (req, res, next) => {
let userParams = getUserParams(req.body);
User.create(userParams)
.then(user => {
res.locals.redirect = "/users";
res.locals.user = user;
next();
})
.catch(error => {
console.log(`Erreur lors de la création de l'utilisateur: ${error.message}`);
res.locals.redirect = "/users/new";
next();
});
},
redirectView: (req, res, next) => {
let redirectPath = res.locals.redirect;
if (redirectPath) res.redirect(redirectPath);
else next();
},
show: (req, res, next) => {
let userId = req.params.id;
User.findById(userId)
.then(user => {
res.locals.user = user;
next();
})
.catch(error => {

console.log(`Erreur lors de la récupération de l'utilisateur par ID: ${error.message}`);
next(error);
});
},
showView: (req, res) => {
res.render("users/show");
},
edit: (req, res, next) => {
let userId = req.params.id;
User.findById(userId)
.then(user => {
res.render("users/edit", {
user: user
});
})
.catch(error => {
console.log(`Erreur lors de la récupération de l'utilisateur par ID: ${error.message}`);
next(error);
});
},
update: (req, res, next) => {
let userId = req.params.id,
userParams = getUserParams(req.body);
User.findByIdAndUpdate(userId, {
$set: userParams
})
.then(user => {
res.locals.redirect = `/users/${userId}`;
res.locals.user = user;
next();
})
.catch(error => {
console.log(`Erreur lors de la mise à jour de l'utilisateur par ID: ${error.message}`);
next(error);
});
},
delete: (req, res, next) => {
let userId = req.params.id;
User.findByIdAndDelete(userId)
.then(() => {
res.locals.redirect = "/users";
next();
})

.catch(error => {
console.log(`Erreur lors de la suppression de l'utilisateur par ID: ${error.message}`);
next();
});
}
};