const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tipoVehiculoSchema = new Schema({
  nombre: String,
  noc: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const TipoVehiculo = mongoose.model("TipoVehiculo", tipoVehiculoSchema);
module.exports = TipoVehiculo;
