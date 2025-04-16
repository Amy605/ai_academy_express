const mongoose = require("mongoose");
const { Schema } = mongoose;
const courseSchema = new Schema(
{
title: {
type: String,
required: true,
unique: true

},
description: {
type: String,
required: true
},
maxStudents: {
type: Number,
default: 0,
min: [0, "Le cours ne peut pas avoir un nombre négatif d'étudiants"]
},
cost: {
type: Number,
default: 0,
min: [0, "Le cours ne peut pas avoir un coût négatif"]
},
students: [{
type: Schema.Types.ObjectId,
ref: "User"
}]
},
{
timestamps: true
}
);
module.exports = mongoose.model("Course", courseSchema);