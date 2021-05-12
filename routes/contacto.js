const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
require('../models/Contacto');
const Contacto = mongoose.model('contactos')
/*
var storage = multer.diskStorage({
	destination: function (req, res, cb) {
		cb(null, "./uploads")
	},

	filename: function (req, res, cb) {
		cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
	},

})

var upload = multer({
	storage: storage,
}).single("image")
*/
router.get('/', (req, res) => {
	Contacto.find().then((contactos)=>{
    res.render("contacto", {contactos:contactos, title:'Contactos'})
  })
})

router.post('/new', (req, res) => {
	var erros = []

	if (!req.body.email || typeof req.body.email == undefined || req.body.email == null || req.body.email.length < 4) {
    erros.push({texto: "Email Inválido"})
  }

  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    erros.push({texto: "Descrição Inválida"})
  }

	if (erros.length > 0) {
		res.render('contacto', {erros:erros})
	}else{
		const novoContacto= {
			email: req.body.email,
			descricao: req.body.descricao,
		}
		new Contacto(novoContacto).save().then(() => {
		 console.log('Contacto salvo com sucesso');
		 req.flash('success_msg', "Contacto salvo com sucesso!")
		 res.redirect("/")
	 }).catch((erro) =>{
		 req.flash('error_msg', "Erro ao salvar o Contacto!")
		 res.redirect('/')
		 //console.log("Erro ao salvar a Categoria" + erro);
	 })

	}
})

module.exports = router
