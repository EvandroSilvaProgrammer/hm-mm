const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Contacto = new Schema({
  email:{
    type: String,
    required: true
  },

  descricao:{
    type: String,
    required: true
  },
  data:{
    type: Date,
    default: Date.now()
  }
})

mongoose.model("contactos", Contacto)
