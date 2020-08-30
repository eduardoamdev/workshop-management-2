const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const grupoCiaSchema = new Schema({
  nombre: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const GrupoCia = mongoose.model("GrupoCia", grupoCiaSchema);
module.exports = GrupoCia;
