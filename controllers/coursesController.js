const Course = require("../models/course");
// Fonction utilitaire pour extraire les paramètres du cours du corps de la requête
const getCourseParams = body => {
return {
title: body.title,
description: body.description,
maxStudents: body.maxStudents,
cost: body.cost
};
};
module.exports = {
index: (req, res, next) => {
Course.find({})
.then(courses => {
res.locals.courses = courses;
next();
})
.catch(error => {
console.log(`Erreur lors de la récupération des cours: ${error.message}`);
next(error);
});
},
indexView: (req, res) => {
res.render("courses/index");
},
new: (req, res) => {
res.render("courses/new");
},
create: (req, res, next) => {
let courseParams = getCourseParams(req.body);
Course.create(courseParams)
.then(course => {

res.locals.redirect = "/courses";
res.locals.course = course;
next();
})
.catch(error => {
console.log(`Erreur lors de la création du cours: ${error.message}`);
res.locals.redirect = "/courses/new";
next();
});
},
redirectView: (req, res, next) => {
let redirectPath = res.locals.redirect;
if (redirectPath) res.redirect(redirectPath);
else next();
},
show: (req, res, next) => {
let courseId = req.params.id;
Course.findById(courseId)
.populate("students")
.then(course => {
res.locals.course = course;
next();
})
.catch(error => {
console.log(`Erreur lors de la récupération du cours par ID: ${error.message}`);
next(error);
});
},
showView: (req, res) => {
res.render("courses/show");
},
edit: (req, res, next) => {
let courseId = req.params.id;
Course.findById(courseId)
.then(course => {
res.render("courses/edit", {
course: course
});
})
.catch(error => {
console.log(`Erreur lors de la récupération du cours par ID: ${error.message}`);
next(error);
});
},

update: (req, res, next) => {
let courseId = req.params.id,
courseParams = getCourseParams(req.body);
Course.findByIdAndUpdate(courseId, {
$set: courseParams
})
.then(course => {
res.locals.redirect = `/courses/${courseId}`;
res.locals.course = course;
next();
})
.catch(error => {
console.log(`Erreur lors de la mise à jour du cours par ID: ${error.message}`);
next(error);
});
},
delete: (req, res, next) => {
    let courseId = req.params.id;
    console.log(`Tentative de suppression du cours ID: ${courseId}`); // Debug log
    
    Course.findByIdAndDelete(courseId)
    .then(() => {
        console.log(`Cours ${courseId} supprimé avec succès`); // Debug log
        res.locals.redirect = "/courses";
        next();
    })
    .catch(error => {
        console.log(`Erreur lors de la suppression: ${error.message}`);
        next(error);
    });
}
};