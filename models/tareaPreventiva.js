const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tareaPreventivaSchema = new Schema({
  periodicidad: String,
  descripcion: String,
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const TareaPreventiva = mongoose.model("TareaPreventiva", tareaPreventivaSchema);
module.exports = TareaPreventiva;
