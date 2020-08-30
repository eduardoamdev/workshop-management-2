const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const repuestoSchema = new Schema({
  nombre: String,
  noc: String,
  fechaPeticion: String,
  fechaRecepcion: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Repuesto = mongoose.model("Repuesto", repuestoSchema);
module.exports = Repuesto;
