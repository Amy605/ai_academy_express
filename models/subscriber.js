const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom est obligatoire"],
    trim: true,
    minlength: [2, "Le nom doit contenir au moins 2 caractères"]
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    lowercase: true,
    trim: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Veuillez entrer un email valide"]
  },
  zipCode: {
    type: String, // Type changé à String
    required: [true, "Le code postal est obligatoire"],
    validate: {
      validator: function(v) {
        return /^\d{5}$/.test(v);
      },
      message: "Le code postal doit contenir exactement 5 chiffres"
    }
  }
}, { 
  timestamps: true 
});

// Méthodes inchangées
subscriberSchema.methods.getInfo = function() {
  return `Nom: ${this.name} Email: ${this.email} Code Postal: ${this.zipCode}`;
};

subscriberSchema.methods.findLocalSubscribers = function() {
  return this.model("Subscriber")
    .find({ zipCode: this.zipCode })
    .exec();
};

module.exports = mongoose.model("Subscriber", subscriberSchema);