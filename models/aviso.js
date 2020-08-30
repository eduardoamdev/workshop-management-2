const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avisoSchema = new Schema({
  fechaProximaPreventiva: String,
  periodicidadPreventiva: String,
  vehiculo: String,
  fechaIngresoPreventiva: String,
  mostrarEnCalendario: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Aviso = mongoose.model("Aviso", avisoSchema);
module.exports = Aviso;
