const express = require('express');
const router = express.Router();

const Ingreso = require("../models/ingreso");
const Repuesto = require("../models/repuesto");

const expresionRegularNombre = /./;
const expresionRegularNoc = /\d\d\d\d\-\d\d\-\d\d\d\-\d\d\d\d$/;
const expresionRegularFecha = /\d\d\d\d\-\d\d\-\d\d$/;

let ingresoSeleccionado = {};
let repuestosIngreso = [];
let repuestoSeleccionado = {};

router.get('/repuestos/:idIngreso', (req, res) => {
  let idIngreso = req.params.idIngreso;
  Ingreso.findById(idIngreso)
    .then((ingresoEncontrado) => {
      ingresoSeleccionado = ingresoEncontrado;
      idsRepuestos = [];
      idsRepuestos = ingresoEncontrado.repuestos;
      Repuesto.find()
        .then((repuestosEncontrados) => {
          let todosLosRepuestos = repuestosEncontrados;
          let repuestosDelIngreso = [];
          repuestosDelIngreso = todosLosRepuestos.filter(repuesto => {
            return ingresoSeleccionado.repuestos.includes(repuesto._id);
          })
          repuestosIngreso = repuestosDelIngreso;
          res.redirect('/pintarRepuestos');
        })
    })
})

router.get('/pintarRepuestos', (req, res) => {
  let repuestos = repuestosIngreso;
  res.render('repuestos/repuestos_ingreso', { repuestos });
})

router.get('/nuevoRepuesto', (req, res) => {
  res.render('repuestos/nuevo_repuesto');
})

router.post('/nuevoRepuesto', (req, res) => {
  let idIngreso = ingresoSeleccionado._id;
  let nombreRepuesto = req.body.nombre;
  let nocRepuesto = req.body.noc;
  let fechaPeticionRepuesto = req.body.fechaPeticion;
  if (
    expresionRegularNombre.test(nombreRepuesto) &&
    expresionRegularNoc.test(nocRepuesto) &&
    expresionRegularFecha.test(fechaPeticionRepuesto)
  ) {
    Repuesto.create({
      nombre: nombreRepuesto,
      noc: nocRepuesto,
      fechaPeticion: fechaPeticionRepuesto,
    })
      .then((repuesto) => {
        let nuevoRepuesto = repuesto;
        Ingreso.findByIdAndUpdate(idIngreso,
          { $push: { repuestos: nuevoRepuesto } })
          .then((ingresoSinActualizar) => {
            Ingreso.findById(idIngreso)
              .then((ingreso) => {
                let ingresoActualizado = ingreso;
                ingresoSeleccionado = ingresoActualizado;
                Repuesto.find()
                  .then((repuestosEncontrados) => {
                    let todosLosRepuestos = repuestosEncontrados;
                    let repuestosDelIngreso = [];
                    repuestosDelIngreso = todosLosRepuestos.filter(repuesto => {
                      return ingresoActualizado.repuestos.includes(repuesto._id);
                    })
                    repuestosIngreso = repuestosDelIngreso;
                    repuestos = repuestosDelIngreso;
                    res.render('repuestos/repuestos_ingreso', { repuestos });
                  })
              })
          })
      })
  } else if (!expresionRegularNombre.test(nombreRepuesto)) {
    res.render('repuestos/nuevo_repuesto', {
      idIngreso,
      message: "Introduce el nombre del repuesto correctamente."
    })
  } else if (!expresionRegularNoc.test(nocRepuesto)) {
    res.render('repuestos/nuevo_repuesto', {
      idIngreso,
      message: "Introduce el noc del repuesto correctamente."
    })
  } else if (!expresionRegularFecha.test(fechaPeticionRepuesto)) {
    res.render('repuestos/nuevo_repuesto', {
      idIngreso,
      message: "Introduce la fecha de solicitud del repuesto correctamente."
    })
  }
});

router.get('/modificarRepuesto/:id', (req, res) => {
  let idRepuesto = req.params.id;
  Repuesto.findById(idRepuesto)
    .then((repuestoEncontrado) => {
      repuestoSeleccionado = repuestoEncontrado;
      res.redirect('/pintarModificarRepuesto');
    })
})

router.get('/pintarModificarRepuesto', (req, res) => {
  let repuesto = repuestoSeleccionado;
  res.render('repuestos/modificar_repuesto', { repuesto });
})

router.post('/modificarRepuesto', (req, res) => {
  let idRepuesto = repuestoSeleccionado._id;
  let nombreRepuesto = req.body.nombre;
  let nocRepuesto = req.body.noc;
  let fechaPeticionRepuesto = req.body.fechaPeticion;
  let fechaRecepcionRepuesto = req.body.fechaRecepcion;
  let repuesto = repuestoSeleccionado;
  if (
    expresionRegularNombre.test(nombreRepuesto) &&
    expresionRegularNoc.test(nocRepuesto) &&
    expresionRegularFecha.test(fechaPeticionRepuesto) &&
    (expresionRegularFecha.test(fechaRecepcionRepuesto) ||
      !expresionRegularNombre.test(fechaRecepcionRepuesto))
  ) {
    Repuesto.findByIdAndUpdate(idRepuesto, {
      nombre: nombreRepuesto,
      noc: nocRepuesto,
      fechaPeticion: fechaPeticionRepuesto,
      fechaRecepcion: fechaRecepcionRepuesto,
    })
      .then((repuestoSinActualizar) => {
        Repuesto.findById(idRepuesto)
          .then((repuestoActualizado) => {
            repuestoSeleccionado = repuestoActualizado;
            let idIngreso = ingresoSeleccionado._id;
            Ingreso.findById(idIngreso)
              .then((ingresoEncontrado) => {
                ingresoSeleccionado = ingresoEncontrado;
                idsRepuestos = [];
                idsRepuestos = ingresoEncontrado.repuestos;
                Repuesto.find()
                  .then((repuestosEncontrados) => {
                    let todosLosRepuestos = repuestosEncontrados;
                    let repuestosDelIngreso = [];
                    repuestosDelIngreso = todosLosRepuestos.filter(repuesto => {
                      return ingresoSeleccionado.repuestos.includes(repuesto._id);
                    })
                    repuestosIngreso = repuestosDelIngreso;
                    res.redirect('/pintarRepuestos');
                  })
              })
          })
      })
  } else if (!expresionRegularNombre.test(nombreRepuesto)) {
    res.render('repuestos/modificar_repuesto', {
      repuesto,
      message: "Introduce el nombre del repuesto correctamente."
    })
  } else if (!expresionRegularNoc.test(nocRepuesto)) {
    res.render('repuestos/modificar_repuesto', {
      repuesto,
      message: "Introduce el noc del repuesto correctamente."
    })
  } else if (!expresionRegularFecha.test(fechaPeticionRepuesto)) {
    res.render('repuestos/modificar_repuesto', {
      repuesto,
      message: "Introduce la fecha de solicitud del repuesto correctamente."
    })
  } else if (!expresionRegularFecha.test(fechaRecepcionRepuesto)) {
    res.render('repuestos/modificar_repuesto', {
      repuesto,
      message: "Introduce la fecha de recepción del repuesto correctamente."
    })
  }
});

router.get('/confirmarBorrado/:id', (req, res) => {
  let idRepuesto = req.params.id;
  Repuesto.findById(idRepuesto)
    .then((repuestoEncontrado) => {
      repuestoSeleccionado = repuestoEncontrado;
      res.redirect('/pintarConfirmacionBorrado');
    })
})

router.get('/pintarConfirmacionBorrado', (req, res) => {
  res.render('repuestos/confirmar_borrado_repuesto');
})

router.get('/borrarRepuesto', (req, res) => {
  let idRepuestoSeleccionado = repuestoSeleccionado._id;
  Repuesto.findByIdAndDelete(idRepuestoSeleccionado)
    .then((repuestoBorrado) => {
      repuestoSeleccionado = {};
      idIngreso = ingresoSeleccionado._id;
      Ingreso.findById(idIngreso)
        .then((ingresoEncontrado) => {
          ingreso = ingresoEncontrado;
          idIngreso = ingreso._id;
          let repuestosSinActualizar = ingreso.repuestos;
          let repuestosActualizados = [];
          repuestosActualizados = repuestosSinActualizar.filter((idRepuesto => {
            return idRepuesto.toString() !== idRepuestoSeleccionado.toString();
          }))
          Ingreso.findOneAndUpdate({ _id: idIngreso }, {
            repuestos: repuestosActualizados
          })
            .then((ingresoSinActualizar) => {
              Ingreso.findById(ingresoSinActualizar._id)
                .then((ingreso) => {
                  ingresoSeleccionado = ingreso;
                  idsRepuestos = [];
                  let ingresoActualizado = ingreso;
                  idsRepuestos = ingresoActualizado.repuestos;
                  Repuesto.find()
                    .then((repuestosEncontrados) => {
                      let todosLosRepuestos = repuestosEncontrados;
                      let repuestosDelIngreso = [];
                      repuestosDelIngreso = todosLosRepuestos.filter(repuesto => {
                        return ingresoActualizado.repuestos.includes(repuesto._id);
                      })
                      repuestosIngreso = repuestosDelIngreso;
                      res.redirect('/pintarRepuestos');
                    })
                })
            })
        })
    })
})


module.exports = router;
