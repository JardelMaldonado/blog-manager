import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategoriaSchema = new Schema({
  nome: {
    type: String,
    required: true // corrigido de "require" para "required"
  },
  slug: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model("categorias", CategoriaSchema);
