const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
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
      min: [10000, "Code postal trop court"],
      max: 99999
    },
    password: {
      type: String,
      // required: true - Non nécessaire avec passport-local-mongoose
    },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    subscribedAccount: { type: Schema.Types.ObjectId, ref: "Subscriber" }
  },
  {
    timestamps: true
  }
);

// Attribut virtuel pour le nom complet
userSchema.virtual("fullName").get(function() {
  return `${this.name.first} ${this.name.last}`;
});

// Hook pre-save pour associer un abonné à l'utilisateur
userSchema.pre("save", function(next) {
  let user = this;
  if (user.subscribedAccount === undefined) {
    mongoose.model("Subscriber").findOne({ email: user.email })
      .then(subscriber => {
        user.subscribedAccount = subscriber;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la connexion avec l'abonné: ${error.message}`);
        next(error);
      });
  } else {
    next();
  }
});

// Configuration de passport-local-mongoose
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  errorMessages: {
    MissingPasswordError: 'Aucun mot de passe fourni',
    AttemptTooSoonError: 'Le compte est bloqué temporairement. Réessayez plus tard',
    TooManyAttemptsError: 'Trop de tentatives de connexion. Le compte est bloqué',
    NoSaltValueStoredError: 'Impossible de vérifier le mot de passe sans salt',
    IncorrectPasswordError: 'Mot de passe incorrect',
    IncorrectUsernameError: 'Email incorrect',
    MissingUsernameError: 'Aucun email fourni',
    UserExistsError: 'Un utilisateur avec cet email existe déjà'
  }
});

// Méthode pour comparer les mots de passe (conservée pour compatibilité)
userSchema.methods.passwordComparison = function(inputPassword) {
  return new Promise((resolve, reject) => {
    this.authenticate(inputPassword, (err, user, passwordError) => {
      if (err) return reject(err);
      if (passwordError) return resolve(false);
      resolve(true);
    });
  });
};

module.exports = mongoose.model("User", userSchema);