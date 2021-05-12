/*  Dependencias/modulos  */
const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const mongoose = require('mongoose');
const path = require('path')
const session = require('express-session');
const flash = require('connect-flash');
const usuarios = require('./routes/usuario')
require('./models/Postagem');
require('./models/Categoria');
require('./models/Contacto');
const Postagens = mongoose.model('postagens')
const Categorias = mongoose.model('categorias')
const Contactos = mongoose.model('contactos')
const passport = require('passport');
require('./config/auth')(passport);
/* Modulos */
const admin = require('./routes/admin')
const contactos = require('./routes/contacto')

/* Constantes */
const PORT = 3000
const app = express()

/* Configurações */

//Mongoose
mongoose.Promisse = global.Promisse
mongoose.connect('mongodb://localhost/blogcomercio', {useNewUrlParser: true, useUnifiedTopology: true}).then(() =>{
  console.log("Conectado com sucesso ao BD");
}).catch((erro) =>{
  console.log("Erro ao se conectar ao BD: " + erro);
});

//Session
app.use(session({
  secret: 'blogcomercio',
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
//flash
app.use(flash())

//Middleware
app.use((req, res, next) =>{
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  //res.locals.erro_msg = req.flash('erro_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})


//Body-Parser
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//HandleBars
app.engine('handlebars', handlebars({defaultLayout:'main', runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
  }))
app.set('view engine', 'handlebars')

//Arquivos estaticos
app.use(express.static(path.join(__dirname, 'public')))

/* Rotas */

app.get('/', (req, res) => {
  //res.render('index')
  var todos = []
  Postagens.find().populate('categoria').sort({data:'desc'}).then((postagens) => {
      for (var i = 0; i < postagens.length; i++) {
        todos.push(postagens[i])
      }
      res.render("index", {title:'Index', todos:todos})
  }).catch((erro) => {
    req.flash("error_msg", "Houve um erro interno")
    res.redirect('/404')
  })
})

app.get('/404', (req, res) => {
  res.send('Erro 404')
})

app.get('/categorias', (req, res) => {
  Categorias.find().then((categorias) => {
    res.render('categorias/index', {categorias: categorias})
  }).catch((erro) =>{
    req.flash("error_msg", "Houve um erro interno")
    res.redirect('/')
  })
})

app.get('/sobre', (req, res) => {
    res.render('sobre', {titulo: 'Sobre'})
})

app.get('/blog', (req, res) => {
    res.render('blog', {titulo: 'Postagens'})
})

app.get('/categorias/:slug', (req, res) => {
  Categorias.findOne({slug: req.params.slug}).then((categoria) => {
    if (categoria) {
      Postagens.find({categoria: categoria._id}).then((postagens) => {

        res.render('categorias/postagens', {postagens: postagens, categoria:categoria})

      }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro ao listar os posts")
        res.redirect('/')
      });
    } else {
      req.flash("error_msg", "Houve um erro ao listar os posts")
      res.redirect('/')
    }
  }).catch((erro) =>{
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect('/')
  });
})

/* Outras Rotas */
app.use('/admin', admin)
app.use('/usuarios', usuarios)
app.use('/contacto', contactos)
/* Configurações do Servidor */
app.listen(PORT, () => {
	console.log('Executando o Servidor na porta: ' + PORT)
})
