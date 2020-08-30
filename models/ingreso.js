const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingresoSchema = new Schema({
  fechaEntrada: String,
  fechaSalida: String,
  orden: String,
  motivo: String,
  repuestos: [{ type: Schema.Types.ObjectId, ref: "Repuesto" }],
  preventivas: [{ type: Schema.Types.ObjectId, ref: "Preventiva" }],
  correctivas: [{ type: Schema.Types.ObjectId, ref: "Correctiva" }],
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Ingreso = mongoose.model("Ingreso", ingresoSchema);
module.exports = Ingreso;
