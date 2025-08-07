const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser')
const path = require('path');

// Carpeta pública para archivos estáticos (imágenes, CSS, JS)
const principalController = require('./routes/adm_tick');
const hbs = require('hbs');

hbs.registerHelper('eq', function (a, b) {
  return a == b;
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));


app.set('port', process.env.PORT || 8000);

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
	extname: '.hbs',
}));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ 
	extended: true 
}));
app.use(bodyParser.json());	

app.use(myconnection(mysql, {
	host: 'localhost',
	user: 'root',
	password: '',
	port: 3307,
	database: 'bdabarrotes'
	//databasse: 'tienda_erick'
}));

app.listen(app.get('port'), () => {
	console.log('listening on port ', app.get('port'));
});

app.use('/', principalController);

app.get('/', (req, res) => {
	res.render('home');
});