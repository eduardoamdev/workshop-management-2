const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehiculoSchema = new Schema({
  matricula: String,
  noc: String,
  tipo: String,
  ingresos: [{ type: Schema.Types.ObjectId, ref: "Ingreso" }],
  grupoCia: String,
  ingresadoActualmente: String,
  ordenIngresoActual: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Vehiculo = mongoose.model("Vehiculo", vehiculoSchema);
module.exports = Vehiculo;
