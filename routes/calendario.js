const express = require('express');
const router = express.Router();


const Aviso = require('../models/aviso');

const moment = require('moment');

router.get('/calendario', (req, res) => {
  Aviso.find()
    .then((avisosEncontrados) => {
      let avisos = avisosEncontrados;
      let avisosActivos = [];
      avisosActivos = avisos.filter((aviso) => {
        return aviso.mostrarEnCalendario === "si";
      })
      avisosActivos.sort((a, b) => {
        return new Date(a.fechaProximaPreventiva) - new Date(b.fechaProximaPreventiva);
      })
      res.render('calendario/calendario', { avisosActivos });
    })
})

router.get('/eliminarDeLista/:id', (req, res) => {
  let idAviso = req.params.id;
  Aviso.findByIdAndUpdate(idAviso, {
    mostrarEnCalendario: "no"
  })
    .then((avisoSinActualizar) => {
      res.redirect('/calendario');
    })
})

router.get('/avisosEliminados', (req, res) => {
  Aviso.find()
    .then((avisosEncontrados) => {
      let avisos = avisosEncontrados;
      let avisosEliminados = [];
      avisosEliminados = avisos.filter((aviso) => {
        return aviso.mostrarEnCalendario === "no";
      })
      avisosEliminados.sort((a, b) => {
        return new Date(a.fechaProximaPreventiva) - new Date(b.fechaProximaPreventiva);
      })
      res.render('calendario/avisos_eliminados', { avisosEliminados });
    })
})

router.get('/restaurarAviso/:id', (req, res) => {
  let idAviso = req.params.id;
  Aviso.findByIdAndUpdate(idAviso, {
    mostrarEnCalendario: "si"
  })
    .then((avisoSinActualizar) => {
      res.redirect('/calendario');
    })
})


module.exports = router;
