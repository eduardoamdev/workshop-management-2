require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const hbs = require('hbs');


const app = express();


mongoose
  .connect(`mongodb://localhost/${process.env.DB_CONFIG}`, { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });


hbs.registerHelper('ifEqual', function (option1, option2, options) {
  if (option1 === option2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

const portada = require('./routes/portada');
app.use('/', portada);

const vehiculos = require('./routes/vehiculos');
app.use('/', vehiculos);

const ingresos = require('./routes/ingresos');
app.use('/', ingresos);

const repuestos = require('./routes/repuestos');
app.use('/', repuestos);

const tareas = require('./routes/tareas');
app.use('/', tareas);

const calendario = require('./routes/calendario');
app.use('/', calendario);


module.exports = app;
