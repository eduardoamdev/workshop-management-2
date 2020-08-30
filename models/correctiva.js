const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const correctivaSchema = new Schema({
  fecha: String,
  descripcion: String,
  observaciones: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Correctiva = mongoose.model("Correctiva", correctivaSchema);
module.exports = Correctiva;
