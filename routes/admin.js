const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagem');
const Categorias = mongoose.model('categorias')
const Postagens = mongoose.model('postagens')
const Usuario = mongoose.model('usuarios')
const multer = require('multer');
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
	Usuario.find().sort({nome: 'asc'}).then((usuarios)=>{
    res.render("admin/index", {usuarios:usuarios, title:'Página Administrativa'})
  })
})

router.get('/categorias', (req, res) => {
	//res.render('admin/categorias')
	Categorias.find().sort({nome: 'asc'}).then((categorias)=>{
    res.render("admin/categorias", {categorias:categorias, title:'Categorias'})
  }).catch((erro) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect('/admin')
  })
})

router.get('/categorias/add', (req, res) => {
	res.render('admin/addcategorias')
})
/*
router.get('/categorias/edit/:id', (req, res) => {
	Categorias.findOne({_id:req.params.id}).then((categoria) => {
    res.render("admin/editcategorias", {categoria:categoria, title:'Editar Categorias'})
  }).catch((erro) =>{
    req.flash('error_msg', "Erro ao editar a categoria!")
    res.redirect('/admin/categorias')
    //console.log("Erro ao salvar a Categoria" + erro);
  })
})
*/
router.post('/categorias/new', (req, res) => {
	var erros = []

	if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 4) {
    erros.push({texto: "Nome Inválido"})
  }

  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    erros.push({texto: "Descrição Inválida"})
  }

	if (erros.length > 0) {
		res.render('admin/addcategorias', {erros:erros})
	}else{
		const novaCategoria = {
			nome: req.body.nome,
			descricao: req.body.descricao,
			slug: req.body.nome.replace(' ', '_').toLowerCase()
		}
		new Categorias(novaCategoria).save().then(() => {
		 //console.log('Categoria salva com sucesso');
		 req.flash('success_msg', "Categoria salva com sucesso!")
		 res.redirect("/admin/categorias")
	 }).catch((erro) =>{
		 req.flash('error_msg', "Erro ao salvar a categoria!")
		 res.redirect('/admin')
		 //console.log("Erro ao salvar a Categoria" + erro);
	 })

	}
})

router.get('/categorias/edit/:id', (req, res) => {
	Categorias.findOne({_id:req.params.id}).then((categoria) => {
    res.render("admin/editcategorias", {categoria:categoria, title:'Editar Categorias'})
  }).catch((erro) =>{
    req.flash('error_msg', "Erro: categoria Inválida!")
    res.redirect('/admin/categorias')
    //console.log("Erro ao salvar a Categoria" + erro);
  })
})

router.post("/categorias/edit", (req, res) => {
	var erros = []

	Categorias.findOne({_id: req.body.id}).then((categoria) => {
    categoria.nome = req.body.nome
    categoria.descricao = req.body.descricao

		if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 4) {
	    erros.push({texto: "Nome Inválido"})
	  }

	  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
	    erros.push({texto: "Descrição Inválida"})
	  }

		if (erros.length > 0) {
			res.render('admin/editcategorias', {erros:erros})
		}
		else{
			categoria.slug = req.body.nome.replace(' ', '_').toLowerCase()
			categoria.save().then(() => {
	      req.flash('success_msg', "Categoria editada com sucesso!")
	      res.redirect('/admin/categorias')
	    }).catch((erro) =>{
	      req.flash('error_msg', "Erro ao editar a categoria!")
	      res.redirect('/admin/categorias')
	    })
		}
  }).catch((erro) =>{
    req.flash('error_msg', "Erro ao editar a categoria!")
    res.redirect('/admin/categorias')
  })
})

router.get('/categorias/delete/:id', (req, res) => {
	/*
	Categorias.remove({_id:req.params.id}).then(() => {
		req.flash('success_msg', "Categoria eliminada com sucesso!")
		res.redirect('/admin/categorias')
	}).catch((erro) => {
		req.flash('error_msg', "Erro ao eliminar a categoria!")
    res.redirect('/admin/categorias')
	})
	*/
})

//Postagens
router.get('/postagens', (req, res) => {
	Postagens.find().populate('categoria').sort({nome:'asc'}).then((postagens) => {
		 res.render('admin/postagens', {postagens:postagens})
 }).catch((erro) =>{
	 req.flash('error_msg', "Houve um erro ao listar as postagens!")
	 res.redirect('/admin')
 })

})

router.get('/postagens/add', (req, res) => {
	Categorias.find().then((categoria) => {
    res.render('admin/addpostagens', {categoria:categoria})
  }).catch((erro) =>{
    req.flash('error_msg', "Erro: categoria Inválida!")
    res.redirect('/admin/postagens')
    //console.log("Erro ao salvar a Categoria" + erro);
  })
})

router.post('/postagens/new', (req, res) => {
	var erros = []

	if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length < 4) {
		erros.push({texto: "Titulo Inválido"})
	}

	if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
		erros.push({texto: "Descrição Inválida"})
	}

	if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length < 4) {
		erros.push({texto: "Conteudo Inválido"})
	}

	if (req.body.categoria == "0") {
		erros.push({texto: "Categoria Inválida"})
	}

	if (erros.length > 0) {
		Categorias.find().then((categoria) => {
	    res.render('admin/addpostagens', {categoria:categoria, erros:erros})
	  })
	}else{
		const novaPostagem = {
			titulo: req.body.titulo,
			conteudo: req.body.conteudo,
			descricao: req.body.descricao,
			slug: req.body.titulo.replace(' ', '_').toLowerCase(),
			/*image: req.file.filename,*/
			categoria: req.body.categoria
		}
		new Postagens(novaPostagem).save().then(() => {
		 //console.log('Categoria salva com sucesso');
		 req.flash('success_msg', "Postagem salvo com sucesso!")
		 res.redirect("/admin/postagens")
	 }).catch((erro) =>{
		 req.flash('error_msg', "Erro ao salvar a postagen!")
		 res.redirect('/admin')
		 //console.log("Erro ao salvar a Categoria" + erro);
	 })

	}
})

router.post('/postagens/edit', (req,res) => {
	var erros = []

	Postagens.findOne({_id: req.body.id}).then((postagem) => {
	if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length < 4) {
		erros.push({texto: "Titulo Inválido"})
	}

	if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
		erros.push({texto: "Descrição Inválida"})
	}

	if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length < 4) {
		erros.push({texto: "Conteudo Inválido"})
	}

	if (req.body.categoria == "0") {
		erros.push({texto: "Categoria Inválida"})
	}

	if (erros.length > 0) {
		Categorias.find().then((categoria) => {
	    res.render('admin/addpostagens', {categoria:categoria, erros:erros})
	  })
	}
	else{
		postagem.titulo = req.body.titulo
		postagem.descricao = req.body.descricao
		postagem.conteudo = req.body.conteudo
		postagem.slug = req.body.titulo.replace(' ', '_').toLowerCase()
		postagem.categoria = req.body.categoria
		postagem.save().then(() => {
			req.flash('success_msg', "Postagem editada com sucesso!")
			res.redirect('/admin/postagens')
		}).catch((erro) =>{
			req.flash('error_msg', "Erro ao editar a postagem!")
			res.redirect('/admin/postagens')
		})
	}
}).catch((erro) =>{
	req.flash('error_msg', "Erro ao editar a postagem!")
	res.redirect('/admin/postagens')
})
})

router.get('/postagens/edit/:id', (req, res) => {
	Postagens.findOne({_id:req.params.id}).then((postagem) => {

    Categorias.find().then((categorias) => {
      res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})

    }).catch((erro) =>{
      req.flash('error_msg', "Houve um erro ao listar as categorias!")
      res.redirect('/admin/postagens')
    })

  }).catch((erro) =>{
    req.flash('error_msg', "Houve um erro ao carregar o formulário de edição de postagem!")
    res.redirect('/admin/postagens')
  })

})

router.get('/postagens/delete/:id', (req, res) => {
	/*
	Postagens.remove({_id:req.params.id}).then(() => {
		req.flash('success_msg', "Postagem eliminada com sucesso!")
		res.redirect('/admin/postagens')
	}).catch((erro) => {
		req.flash('error_msg', "Erro ao eliminar a postagem!")
    res.redirect('/admin/postagens')
	})
	*/
})

module.exports = router
