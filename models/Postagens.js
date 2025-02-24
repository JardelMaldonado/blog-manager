const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require: true
    },
    conteudo: {
        type: String,
        require: true
    },
    categoria: {
        type: Schema.Types.ObjectId, // Faz referencia a categoria
        ref: "categorias",
        require: true
    },
    data: {
        type: date,
        default: Date.now()
}
})

mongoose.model("postagens", Postagens)