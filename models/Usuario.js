import mongoose from 'mongoose';

const { Schema } = mongoose;

const UsuarioSchema = new Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  eAdmin: {
    type: Number,
    default: 0
  },
  senha: {
    type: String,
    required: true
  }
});

mongoose.model("usuarios", UsuarioSchema);
