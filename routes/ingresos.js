const express = require('express');
const router = express.Router();
const Ingreso = require('../models/ingreso');
const Vehiculo = require('../models/vehiculo');
const Preventiva = require('../models/preventiva');
const Correctiva = require('../models/correctiva');
const Repuesto = require('../models/repuesto');
const Aviso = require('../models/aviso');
const expresionRegularMatricula = /ET-[0-9]{6,6}$/;
const expresionRegularMatriculaRemolque = /ET-[0-9]{6,6}-R$/;
const expresionRegularFecha = /\d{4,4}\-\d{2,2}\-\d{2,2}$/;
const expresionRegularOrden = /\d{8,8}\-\d{4,4}\-\d\w\-\d{5}$/;
const expresionRegularmotivo = /./;


let vehiculoAConsultar = {};
let ingresoSeleccionado = {};
let ingresosVehiculoAConsultar = [];
let coleccionIngresos = "";


router.get('/ingresosVehiculo/:id', (req, res) => {
  coleccionIngresos = "si";
  let idVehiculo = req.params.id;
  Vehiculo.findById(idVehiculo)
    .then((vehiculo) => {
      vehiculoAConsultar = vehiculo;
      Ingreso.find()
        .then((ingresos) => {
          let todosLosIngresos = ingresos;
          let ingresosVehiculo = [];
          let idsIngresos = vehiculoAConsultar.ingresos;
          ingresosVehiculo =
            todosLosIngresos.filter((ingreso) => {
              return idsIngresos.includes(ingreso._id);
            })
          ingresosVehiculoAConsultar = ingresosVehiculo;
          res.redirect('/pintarIngresos');
        })
    })
})

router.get('/pintarIngresos', (req, res) => {
  let vehiculo = vehiculoAConsultar;
  let ingresos = ingresosVehiculoAConsultar;
  ingresos.sort((a, b) => {
    return new Date(b.fechaEntrada) - new Date(a.fechaEntrada);
  })
  res.render('ingresos/ingresos_vehiculo', { ingresos, vehiculo });
})

router.get('/nuevoIngreso', (req, res) => {
  res.render('ingresos/nuevo_ingreso');
})

router.post('/nuevoIngreso', (req, res) => {
  let matriculaVehiculo = req.body.matricula.toUpperCase();
  let fechaEntradaVehiculo = req.body.fechaEntrada;
  let ordenIngreso = req.body.orden.toUpperCase();
  let motivoIngreso = req.body.motivo;
  if ((expresionRegularMatricula.test(matriculaVehiculo) ||
    expresionRegularMatriculaRemolque.test(matriculaVehiculo)) &&
    expresionRegularFecha.test(fechaEntradaVehiculo) &&
    expresionRegularOrden.test(ordenIngreso) &&
    expresionRegularmotivo.test(motivoIngreso)) {
    Vehiculo.find()
      .then((vehiculosEncontrados) => {
        vehiculos = vehiculosEncontrados;
        let vehiculoEncontrado = null;
        vehiculos.map((vehiculo) => {
          if (vehiculo.matricula === matriculaVehiculo) {
            vehiculoEncontrado = vehiculo;
          }
        })
        if (vehiculoEncontrado !== null) {
          let idsIngresos = vehiculoEncontrado.ingresos;
          Ingreso.find()
            .then((ingresos) => {
              let ingresosVehiculo = [];
              let ingresoEnCurso = false;
              ingresosVehiculo = ingresos.filter((ingreso) => {
                return idsIngresos.includes(ingreso._id);
              })
              ingresosVehiculo.map((ingreso) => {
                if (ingreso.fechaSalida === null) {
                  ingresoEnCurso = true;
                }
              })
              if (ingresoEnCurso === false) {
                Ingreso.create({
                  fechaEntrada: fechaEntradaVehiculo,
                  fechaSalida: null,
                  orden: ordenIngreso,
                  motivo: motivoIngreso,
                })
                  .then((ingreso) => {
                    let nuevoIngreso = ingreso
                    let idVehiculo = vehiculoEncontrado._id;
                    Vehiculo.findByIdAndUpdate(idVehiculo, {
                      $push: { ingresos: nuevoIngreso },
                    })
                      .then((vehiculoConIngreso) => {
                        Vehiculo.findByIdAndUpdate(idVehiculo, {
                          ingresadoActualmente: "si",
                          ordenIngresoActual: nuevoIngreso.orden
                        })
                          .then((vehiculoActualizado) => {
                            res.render('ingresos/confirmacion_nuevo_ingreso', {
                              vehiculoActualizado
                            });
                          })
                      })
                  })
              } else {
                res.render('ingresos/nuevo_ingreso', {
                  message: 'El vehiculo se encuentra ya ingresado.'
                });
              }
            })

        } else {
          res.render('ingresos/nuevo_ingreso', {
            message: "La matrícula no se corresponde con ningún vehículo."
          })
        }
      })
  } else if (!expresionRegularMatricula.test(matriculaVehiculo)) {
    res.render('ingresos/nuevo_ingreso', {
      message: 'Formato de matrícula incorrecto.'
    });
  } else if (!expresionRegularFecha.test(fechaEntradaVehiculo)) {
    res.render('ingresos/nuevo_ingreso', {
      message: 'Formato de fecha incorrecto.'
    });
  } else if (!expresionRegularOrden.test(ordenIngreso)) {
    res.render('ingresos/nuevo_ingreso', {
      message: 'Formato de orden incorrecto.'
    });
  } else {
    res.render('ingresos/nuevo_ingreso', {
      message: 'Rellena el campo de síntomas.'
    });
  }
})

router.get('/detalleIngresoActual/:id', (req, res) => {
  coleccionIngresos = "no"
  let idVehiculo = req.params.id;
  Ingreso.find()
    .then((ingresos) => {
      let totalIngresos = ingresos;
      Vehiculo.findById(idVehiculo)
        .then((vehiculo) => {
          vehiculoAConsultar = vehiculo;
          let idsIngresos = vehiculoAConsultar.ingresos;
          let ingresosDelVehiculo = [];
          let ingresoActualArray = [];
          ingresosDelVehiculo =
            totalIngresos.filter((ingreso) => {
              return idsIngresos.includes(ingreso._id);
            })
          ingresoActualArray =
            ingresosDelVehiculo.filter((ingreso) => {
              return ingreso.fechaSalida === null;
            })
          ingresoSeleccionado = ingresoActualArray[0];
          res.redirect('/pintarDetallesIngresoActual');
        })
    })
})

router.get('/detalleIngreso/:id', (req, res) => {
  let idIngreso = req.params.id;
  Ingreso.findById(idIngreso)
    .then((ingreso) => {
      ingresoSeleccionado = ingreso;
    })
  res.redirect('/pintarDetallesIngreso');
})

router.get('/pintarDetallesIngresoActual', (req, res) => {
  let ingreso = ingresoSeleccionado;
  let vehiculo = vehiculoAConsultar;
  res.render('ingresos/ingreso_actual', { ingreso, vehiculo });
})

router.get('/pintarDetallesIngreso', (req, res) => {
  let ingreso = ingresoSeleccionado;
  let vehiculo = vehiculoAConsultar;
  res.render('ingresos/ingreso', { ingreso, vehiculo });
})

router.get('/modificarIngreso', (req, res) => {
  let ingreso = ingresoSeleccionado;
  let coleccionDeIngresos = coleccionIngresos;
  res.render(
    'ingresos/modificar_ingreso',
    { ingreso, coleccionDeIngresos }
  );
})

router.post('/modificarIngresoActual', (req, res) => {
  let coleccionDeIngresos = coleccionIngresos;
  let fechaEntradaVehiculo = req.body.fechaEntrada;
  let fechaSalidaVehiculo = req.body.fechaSalida;
  let ordenIngreso = req.body.orden.toUpperCase();
  let motivoIngreso = req.body.motivo;
  if (fechaSalidaVehiculo == "") {
    fechaSalidaVehiculo = null;
  }
  if (expresionRegularFecha.test(fechaEntradaVehiculo) &&
    (expresionRegularFecha.test(fechaSalidaVehiculo)
      || fechaSalidaVehiculo == null) &&
    expresionRegularOrden.test(ordenIngreso) &&
    expresionRegularmotivo.test(motivoIngreso)) {
    Ingreso.findByIdAndUpdate({ _id: ingresoSeleccionado._id }, {
      fechaEntrada: fechaEntradaVehiculo,
      fechaSalida: fechaSalidaVehiculo,
      orden: ordenIngreso,
      motivo: motivoIngreso
    })
      .then((ingresoSinActualizar) => {
        Ingreso.findById(ingresoSinActualizar._id)
          .then((ingresoActualizado) => {
            let ingreso = ingresoActualizado;
            if (ingreso.preventivas) {
              let idsPreventivas = ingreso.preventivas;
              idsPreventivas.forEach((idPreventiva) => {
                Preventiva.findById(idPreventiva)
                  .then((preventivaEncontrada) => {
                    preventiva = preventivaEncontrada;
                    let idAviso = preventiva.aviso;
                    Aviso.findByIdAndUpdate(idAviso, {
                      fechaIngresoPreventiva: ingreso.fechaEntrada
                    })
                      .then((avisoSinActualizar) => {
                      })
                  })
              })
            }
          })
        if (fechaSalidaVehiculo == null) {
          let idVehiculo = vehiculoAConsultar._id;
          Vehiculo.findByIdAndUpdate(idVehiculo, {
            ingresadoActualmente: "si"
          })
            .then((vehiculoSinActualizar) => {
              Ingreso.findById(ingresoSeleccionado._id)
                .then((ingresoModificado) => {
                  let ingreso = ingresoModificado;
                  res.render('ingresos/ingreso_actual', { ingreso });
                })
            })
        } else {
          let idVehiculo = vehiculoAConsultar._id;
          Vehiculo.findByIdAndUpdate(idVehiculo, {
            ingresadoActualmente: "no",
            ordenIngresoActual: ""
          })
            .then((vehiculoSinActualizar) => {
              let vehiculo = vehiculoSinActualizar;
              res.render('ingresos/salida_ingreso', { vehiculo });
            })
        }
      })
  } else if ((!expresionRegularFecha.test(fechaEntradaVehiculo)) ||
    (!expresionRegularFecha.test(fechaSalidaVehiculo) &&
      fechaSalidaVehiculo !== null)) {
    let ingreso = ingresoSeleccionado;
    res.render('ingresos/modificar_ingreso', {
      ingreso,
      coleccionDeIngresos,
      message: 'Formato de fecha incorrecto.'
    });
  } else if (!expresionRegularOrden.test(ordenIngreso)) {
    let ingreso = ingresoSeleccionado;
    res.render('ingresos/modificar_ingreso', {
      ingreso,
      coleccionDeIngresos,
      message: 'Formato de orden incorrecto.'
    });
  } else {
    let ingreso = ingresoSeleccionado;
    res.render('ingresos/modificar_ingreso', {
      ingreso,
      coleccionDeIngresos,
      message: 'Rellena el campo de síntomas.'
    });
  }
})

router.post('/modificarIngreso', (req, res) => {
  let coleccionDeIngresos = coleccionIngresos;
  let fechaEntradaVehiculo = req.body.fechaEntrada;
  let fechaSalidaVehiculo = req.body.fechaSalida;
  let ordenIngreso = req.body.orden.toUpperCase();
  let motivoIngreso = req.body.motivo;
  let ingresoContinuaActivo = false;
  if (fechaSalidaVehiculo == "") {
    fechaSalidaVehiculo = null;
  }
  if (expresionRegularFecha.test(fechaEntradaVehiculo) &&
    (expresionRegularFecha.test(fechaSalidaVehiculo)
      || fechaSalidaVehiculo == null) &&
    expresionRegularOrden.test(ordenIngreso) &&
    expresionRegularmotivo.test(motivoIngreso)) {
    if (fechaSalidaVehiculo == null) {
      Ingreso.find()
        .then((ingresos) => {
          let totalIngresos = ingresos;
          let ingresosActivos = [];
          let idsIngresosVehiculo = vehiculoAConsultar.ingresos;
          let ingresosVehiculo = [];
          let ingresosVehiculoSinSeleccionado = [];
          ingresosActivos = totalIngresos.filter((ingreso) => {
            return ingreso.fechaSalida == null;
          })
          ingresosVehiculo = totalIngresos.filter((ingreso) => {
            return idsIngresosVehiculo.includes(ingreso._id);
          })
          ingresosVehiculoSinSeleccionado = ingresosVehiculo.filter((ingreso) => {
            return ingreso._id.toString() !== ingresoSeleccionado._id.toString();
          })
          ingresosActivos.map((ingreso) => {
            if (ingreso._id.toString() === ingresoSeleccionado._id.toString()) {
              ingresoContinuaActivo = true;
            }
          })
          if (ingresoContinuaActivo === true) {
            Ingreso.findByIdAndUpdate({ _id: ingresoSeleccionado._id }, {
              fechaEntrada: fechaEntradaVehiculo,
              fechaSalida: fechaSalidaVehiculo,
              orden: ordenIngreso,
              motivo: motivoIngreso
            })
              .then((ingresoSinActualizar) => {
                Ingreso.findById(ingresoSinActualizar._id)
                  .then((ingresoEncontrado) => {
                    let vehiculo = vehiculoAConsultar;
                    let ingreso = ingresoEncontrado;
                    ingresoSeleccionado = ingresoEncontrado;
                    Ingreso.findById(ingresoSinActualizar._id)
                      .then((ingresoActualizado) => {
                        let ingreso = ingresoActualizado;
                        if (ingreso.preventivas) {
                          let idsPreventivas = ingreso.preventivas;
                          idsPreventivas.forEach((idPreventiva) => {
                            Preventiva.findById(idPreventiva)
                              .then((preventivaEncontrada) => {
                                preventiva = preventivaEncontrada;
                                let idAviso = preventiva.aviso;
                                Aviso.findByIdAndUpdate(idAviso, {
                                  fechaIngresoPreventiva: ingreso.fechaEntrada
                                })
                                  .then((avisoSinActualizar) => {
                                  })
                              })
                          })
                        }
                      })
                    res.render('ingresos/ingreso', { vehiculo, ingreso });
                  })
              })
          } else {
            let existeOtroIngresoActivo = "no";
            ingresosVehiculoSinSeleccionado.map((ingreso) => {
              if (ingreso.fechaSalida == null) {
                existeOtroIngresoActivo = "si";
              }
            })
            if (existeOtroIngresoActivo == "si") {
              let ingreso = ingresoSeleccionado;
              res.render('ingresos/modificar_ingreso', {
                ingreso,
                coleccionDeIngresos,
                message: 'Este vehículo ya está ingresado.'
              });
            } else {
              let idVehiculo = vehiculoAConsultar._id;
              Vehiculo.findByIdAndUpdate(idVehiculo, {
                ingresadoActualmente: "si"
              })
                .then((vehiculoSinActualizar) => {
                  Vehiculo.findById(idVehiculo)
                    .then((vehiculo) => {
                      vehiculoAConsultar = vehiculo;
                      Ingreso.findByIdAndUpdate({ _id: ingresoSeleccionado._id }, {
                        fechaEntrada: fechaEntradaVehiculo,
                        fechaSalida: fechaSalidaVehiculo,
                        orden: ordenIngreso,
                        motivo: motivoIngreso
                      })
                        .then((ingresoSinActualizar) => {
                          Ingreso.findById(ingresoSinActualizar._id)
                            .then((ingresoEncontrado) => {
                              ingresoSeleccionado = ingresoEncontrado;
                              let vehiculo = vehiculoAConsultar;
                              let ingreso = ingresoEncontrado;
                              if (ingreso.preventivas) {
                                let idsPreventivas = ingreso.preventivas;
                                idsPreventivas.forEach((idPreventiva) => {
                                  Preventiva.findById(idPreventiva)
                                    .then((preventivaEncontrada) => {
                                      preventiva = preventivaEncontrada;
                                      let idAviso = preventiva.aviso;
                                      Aviso.findByIdAndUpdate(idAviso, {
                                        fechaIngresoPreventiva: ingreso.fechaEntrada
                                      })
                                        .then((avisoSinActualizar) => {
                                        })
                                    })
                                })
                              }
                              Vehiculo.findByIdAndUpdate(vehiculo._id, {
                                ordenIngresoActual: ingreso.orden
                              })
                                .then((vehiculoSinActualizar) => { })
                              res.render('ingresos/ingreso_desde_coleccion', { vehiculo });
                            })
                        })
                    })
                })
            }
          }
        })
    } else {
      Ingreso.findById(ingresoSeleccionado._id)
        .then((ingreso) => {
          if (ingreso.fechaSalida == null) {
            let idVehiculo = vehiculoAConsultar._id;
            Vehiculo.findByIdAndUpdate(idVehiculo, {
              ingresadoActualmente: "no",
              ordenIngresoActual: ""
            })
              .then((vehiculoSinActualizar) => {
                Vehiculo.findById(idVehiculo)
                  .then((vehiculo) => {
                    vehiculoAConsultar = vehiculo;
                    Ingreso.findByIdAndUpdate({ _id: ingresoSeleccionado._id }, {
                      fechaEntrada: fechaEntradaVehiculo,
                      fechaSalida: fechaSalidaVehiculo,
                      orden: ordenIngreso,
                      motivo: motivoIngreso
                    })
                      .then((ingresoSinActualizar) => {
                        Ingreso.findById(ingresoSinActualizar._id)
                          .then((ingresoEncontrado) => {
                            ingresoSeleccionado = ingresoEncontrado;
                            let vehiculo = vehiculoAConsultar;
                            let ingreso = ingresoEncontrado;
                            if (ingreso.preventivas) {
                              let idsPreventivas = ingreso.preventivas;
                              idsPreventivas.forEach((idPreventiva) => {
                                Preventiva.findById(idPreventiva)
                                  .then((preventivaEncontrada) => {
                                    preventiva = preventivaEncontrada;
                                    let idAviso = preventiva.aviso;
                                    Aviso.findByIdAndUpdate(idAviso, {
                                      fechaIngresoPreventiva: ingreso.fechaEntrada
                                    })
                                      .then((avisoSinActualizar) => {
                                      })
                                  })
                              })
                            }
                            res.render(
                              'ingresos/salida_ingreso_desde_coleccion',
                              { vehiculo }
                            );
                          })
                      })
                  })
              })
          } else {
            let idVehiculo = vehiculoAConsultar._id;
            Vehiculo.findById(idVehiculo)
              .then((vehiculo) => {
                vehiculoAConsultar = vehiculo;
                Ingreso.findByIdAndUpdate({ _id: ingresoSeleccionado._id }, {
                  fechaEntrada: fechaEntradaVehiculo,
                  fechaSalida: fechaSalidaVehiculo,
                  orden: ordenIngreso,
                  motivo: motivoIngreso
                })
                  .then((ingresoSinActualizar) => {
                    Ingreso.findById(ingresoSinActualizar._id)
                      .then((ingresoEncontrado) => {
                        ingresoSeleccionado = ingresoEncontrado;
                        let vehiculo = vehiculoAConsultar;
                        let ingreso = ingresoEncontrado;
                        if (ingreso.preventivas) {
                          let idsPreventivas = ingreso.preventivas;
                          idsPreventivas.forEach((idPreventiva) => {
                            Preventiva.findById(idPreventiva)
                              .then((preventivaEncontrada) => {
                                preventiva = preventivaEncontrada;
                                let idAviso = preventiva.aviso;
                                Aviso.findByIdAndUpdate(idAviso, {
                                  fechaIngresoPreventiva: ingreso.fechaEntrada
                                })
                                  .then((avisoSinActualizar) => {
                                  })
                              })
                          })
                        }
                        res.render(
                          'ingresos/ingreso',
                          { vehiculo, ingreso }
                        );
                      })
                  })
              })
          }
        })
    }
  } else if ((!expresionRegularFecha.test(fechaEntradaVehiculo)) ||
    (!expresionRegularFecha.test(fechaSalidaVehiculo) &&
      fechaSalidaVehiculo !== null)) {
    let ingreso = ingresoSeleccionado;
    res.render('ingresos/modificar_ingreso', {
      ingreso,
      coleccionDeIngresos,
      message: 'Formato de fecha incorrecto.'
    });
  } else if (!expresionRegularOrden.test(ordenIngreso)) {
    let ingreso = ingresoSeleccionado;
    res.render('ingresos/modificar_ingreso', {
      ingreso,
      coleccionDeIngresos,
      message: 'Formato de orden incorrecto.'
    });
  } else {
    let ingreso = ingresoSeleccionado;
    res.render('ingresos/modificar_ingreso', {
      ingreso,
      coleccionDeIngresos,
      message: 'Rellena el campo de síntomas.'
    });
  }
})

router.get('/pintarIngreso', (req, res) => {
  let vehiculo = vehiculoAConsultar;
  let ingreso = ingresoSeleccionado;
  res.render('ingresos/ingreso', { vehiculo, ingreso });
})

router.get('/confirmacionBorradoIngreso', (req, res) => {
  let vehiculo = vehiculoAConsultar;
  res.render(
    'ingresos/confirmacion_borrado_ingreso',
    { vehiculo }
  );
})

router.get('/borrarIngreso', (req, res) => {
  let idIngreso = ingresoSeleccionado._id;
  Ingreso.findByIdAndDelete(idIngreso)
    .then((ingresoBorrado) => {
      let ingresoEliminado = ingresoBorrado;
      let idVehiculo = vehiculoAConsultar._id;
      Vehiculo.findById(idVehiculo)
        .then((vehiculo) => {
          let idsIngresos = vehiculo.ingresos;
          let ingresosActualizados = [];
          idsIngresos.map((id) => {
            if (id.toString() !== idIngreso.toString()) {
              return ingresosActualizados.push(id);
            }
          })
          if (!ingresoSeleccionado.fechaSalida) {
            Vehiculo.findByIdAndUpdate(idVehiculo, {
              ingresadoActualmente: "no",
              ordenIngresoActual: ""
            })
              .then((vehiculoSinActualizar) => {
              })
          }
          Vehiculo.findByIdAndUpdate(idVehiculo, {
            ingresos: ingresosActualizados
          })
            .then((vehiculoSinActualizar) => {
              Vehiculo.findById(vehiculoSinActualizar)
                .then((vehiculoActualizado) => {
                  vehiculoAConsultar = vehiculoActualizado;
                  let idsIngresos = vehiculoActualizado.ingresos;
                  let ingresosVehiculo = [];
                  idsIngresos.forEach((idIngreso) => {
                    Ingreso.findById(idIngreso)
                      .then((ingreso) => {
                        let ingresoAIncluir = ingreso;
                        ingresosVehiculo.push(ingresoAIncluir);
                      })
                  })
                  ingresosVehiculoAConsultar = ingresosVehiculo;
                })
            })
          let idsCorrectivas = ingresoEliminado.correctivas;
          if (idsCorrectivas.length !== 0) {
            idsCorrectivas.forEach((id) => {
              Correctiva.findByIdAndDelete(id)
                .then((correctivaBorrada) => {
                })
            })
          }
          let idsPreventivas = ingresoEliminado.preventivas;
          if (idsPreventivas.length !== 0) {
            idsPreventivas.forEach((id) => {
              Preventiva.findByIdAndDelete(id)
                .then((preventivaBorrada) => {
                  let idAviso = preventivaBorrada.aviso;
                  Aviso.findByIdAndDelete(idAviso)
                    .then((avisoBorrado) => {
                    })
                })
            })
          }
          let idsRepuestos = ingresoEliminado.repuestos;
          if (idsRepuestos.length !== 0) {
            idsRepuestos.forEach((id) => {
              Repuesto.findByIdAndDelete(id)
                .then((preventivaBorrada) => {
                })
            })
          }
          ingresoSeleccionado = {};
        })
    })
  let idVehiculoAConsultar = vehiculoAConsultar._id;
  res.redirect(`/ingresosVehiculo/${idVehiculoAConsultar}`)
})


module.exports = router;
