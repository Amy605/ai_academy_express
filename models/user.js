const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Subscriber = require("./subscriber");

const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      trim: true
    },
    last: {
      type: String,
      trim: true
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  zipCode: {
    type: Number,
    min: [1000, "Le code postal est trop court"],
    max: 99999
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  subscribedAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" }
}, {
  timestamps: true
});

// Ajoute une propriété virtuelle pour le nom complet
userSchema.virtual("fullName").get(function() {
  return `${this.name.first} ${this.name.last}`;
});

// Configure les options pour le plugin passport-local-mongoose
const options = {
  usernameField: "email",
  errorMessages: {
    MissingPasswordError: "Aucun mot de passe fourni",
    AttemptTooSoonError: "Le compte est bloqué temporairement. Réessayez plus tard",
    TooManyAttemptsError: "Trop de tentatives de connexion. Le compte est bloqué",
    NoSaltValueStoredError: "Impossible d'authentifier sans sel",
    IncorrectPasswordError: "Mot de passe ou email incorrect",
    IncorrectUsernameError: "Mot de passe ou email incorrect",
    MissingUsernameError: "Aucun email fourni",
    UserExistsError: "Un utilisateur avec cet email existe déjà"
  }
};

// Ajoute le plugin passport-local-mongoose
userSchema.plugin(passportLocalMongoose, options);

// Hook pre pour associer un abonné à un utilisateur
userSchema.pre("save", function(next) {
  let user = this;
  if (user.subscribedAccount === undefined) {
    Subscriber.findOne({
      email: user.email
    })
      .then(subscriber => {
        if (subscriber) {
          user.subscribedAccount = subscriber;
          next();
        } else {
          next();
        }
      })
      .catch(error => {
        console.log(`Erreur lors de l'association de l'abonné: ${error.message}`);
        next(error);
      });
  } else {
    next();
  }
});

module.exports = mongoose.model("User", userSchema);