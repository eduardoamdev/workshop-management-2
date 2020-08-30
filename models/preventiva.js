const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const preventivaSchema = new Schema({
  frecuencia: String,
  subtareas: Array,
  fecha: String,
  kilometros: String,
  observaciones: String,
  aviso: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Preventiva = mongoose.model("Preventiva", preventivaSchema);
module.exports = Preventiva;
