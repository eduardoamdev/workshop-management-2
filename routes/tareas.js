const express = require('express');
const router = express.Router();

const Ingreso = require('../models/ingreso');
const TareaPreventiva = require('../models/tareaPreventiva');
const Preventiva = require('../models/preventiva');
const Correctiva = require('../models/correctiva');
const Aviso = require('../models/aviso');
const Vehiculo = require('../models/vehiculo');

const moment = require('moment');

const expresionRegularFecha = /\d{4,4}\-\d{2,2}\-\d{2,2}$/;
const expresionRegularKilometros = /\d+/;
const expresionRegularDescripcion = /./;

let ingresoSeleccionado = {};
let frecuenciasTareas = [];
let preventivasPeriodicidad = [];
let frecuenciaSeleccionada = "";
let preventivaSeleccionada = {};
let correctivaSeleccionada = {};


const frecuenciasPreventivas = () => {
  TareaPreventiva.find()
    .then((tareasPreventivasEncontradas) => {
      let tareasPreventivas = tareasPreventivasEncontradas;
      let frecuenciasRepetidas = [];
      let frecuencias = [];
      let textoFrecuencia = "";
      tareasPreventivas.map((tarea) => {
        return frecuenciasRepetidas.push(tarea.periodicidad);
      })
      frecuenciasRepetidas.sort((a, b) => {
        if (a < b)
          return -1;
        if (a > b)
          return 1;
        return 0;
      })
      frecuencias = frecuenciasRepetidas.filter((frecuencia) => {
        if (frecuencia !== textoFrecuencia) {
          textoFrecuencia = frecuencia;
          return frecuencia;
        }
      })
      frecuenciasTareas = frecuencias;
    })
}

const obtenerPreventivasFrecuencia = (frecuencia) => {
  preventivasPeriodicidad = [];
  TareaPreventiva.find({ periodicidad: frecuencia })
    .then((subtareasEncontradas) => {
      preventivas = subtareasEncontradas;
      preventivasConChecked = [];
      preventivas.map((preventiva) => {
        let preventivaConChecked = [];
        preventivaConChecked.push(preventiva.descripcion);
        preventivaConChecked.push("notChecked");
        return preventivasPeriodicidad.push(preventivaConChecked);
      })
    })
}

const obtenerDiasSiguientePreventiva = (periodicidad) => {
  if (periodicidad === "Anual") {
    return 365;
  } else if (periodicidad === "Bienal") {
    return 730;
  } else if (periodicidad === "Trienal") {
    return 1095;
  } else if (periodicidad === "Cuatrienal") {
    return 1460;
  } else if (periodicidad === "Sexenal") {
    return 2190;
  }
}

router.get('/tareas/:id', (req, res) => {
  let idIngreso = req.params.id;
  frecuenciasPreventivas();
  Ingreso.findById(idIngreso)
    .then((ingresoEncontrado) => {
      ingresoSeleccionado = ingresoEncontrado;
      res.redirect('/pintarTareas');
    })
})

router.get('/pintarTareas', (req, res) => {
  let idIngreso = ingresoSeleccionado._id;
  Ingreso.findById(idIngreso)
    .then((ingresoEncontrado) => {
      let ingreso = ingresoEncontrado;
      let idsPreventivas = ingreso.preventivas;
      let idsCorrectivas = ingreso.correctivas;
      Preventiva.find()
        .then((preventivasEncontradas) => {
          let todasLasPreventivas = preventivasEncontradas;
          let preventivasIngreso = [];
          preventivasIngreso = todasLasPreventivas.filter((preventiva) => {
            return idsPreventivas.includes(preventiva._id);
          })
          Correctiva.find()
            .then((correctivasEncontradas) => {
              let todasLasCorrectivas = correctivasEncontradas;
              let correctivasIngreso = [];
              correctivasIngreso =
                todasLasCorrectivas.filter((correctiva) => {
                  return idsCorrectivas.includes(correctiva._id);
                })
              correctivasIngreso.sort((a, b) => {
                return new Date(b.fecha) - new Date(a.fecha);
              })
              res.render('tareas/tareas', {
                preventivasIngreso,
                correctivasIngreso
              });
            })
        })
    })
})

router.get('/nuevaTarea', (req, res) => {
  res.render('tareas/preventiva_correctiva');
})

router.get('/tipoPreventiva', (req, res) => {
  let frecuencias = frecuenciasTareas;
  res.render('tareas/seleccion_periodicidad', { frecuencias });
})

router.post('/tipoPreventiva', (req, res) => {
  let frecuenciaPreventiva = req.body.frecuencia;
  frecuenciaSeleccionada = frecuenciaPreventiva;
  TareaPreventiva.find({ periodicidad: frecuenciaPreventiva })
    .then((preventivasEncontradas => {
      let preventivas = preventivasEncontradas;
      preventivasPeriodicidad = preventivasEncontradas
      res.render('tareas/nueva_preventiva', { preventivas });
    }))
})

router.post('/nuevaPreventiva', (req, res) => {
  let subtareasPreventiva = [];
  let frecuencia = frecuenciaSeleccionada;
  let listaSubtareas = req.body.subtareas
  if (listaSubtareas) {
    subtareasPreventiva = listaSubtareas;
  }
  let fechaPreventiva = req.body.fecha;
  let kilometrosPreventiva = req.body.kilometros;
  let observacionesPreventiva = req.body.observaciones;
  let preventivas = preventivasPeriodicidad;
  if (subtareasPreventiva.length !== 0 &&
    expresionRegularFecha.test(fechaPreventiva) &&
    expresionRegularKilometros.test(kilometrosPreventiva)) {
    Preventiva.create({
      frecuencia: frecuencia,
      subtareas: subtareasPreventiva,
      fecha: fechaPreventiva,
      kilometros: kilometrosPreventiva,
      observaciones: observacionesPreventiva
    })
      .then((preventivaCreada) => {
        let nuevaPreventiva = preventivaCreada;
        let diasSiguientePreventiva = obtenerDiasSiguientePreventiva(nuevaPreventiva.frecuencia);
        let idIngreso = ingresoSeleccionado._id;
        Ingreso.findByIdAndUpdate(idIngreso,
          { $push: { preventivas: nuevaPreventiva } })
          .then((ingresoSinActualizar) => {
            Vehiculo.find()
              .then((todosLosVehiculos) => {
                let vehiculos = todosLosVehiculos;
                let vehiculoSeleccionado = {};
                vehiculos.map((vehiculo) => {
                  if (vehiculo.ingresos.includes(ingresoSeleccionado._id)) {
                    vehiculoSeleccionado = vehiculo;
                  }
                })
                Aviso.create({
                  fechaProximaPreventiva: moment(nuevaPreventiva.fecha).add(diasSiguientePreventiva, 'days').format('YYYY-MM-DD'),
                  periodicidadPreventiva: nuevaPreventiva.frecuencia,
                  vehiculo: vehiculoSeleccionado.matricula,
                  fechaIngresoPreventiva: ingresoSeleccionado.fechaEntrada,
                  mostrarEnCalendario: "si"
                })
                  .then((avisoCreado) => {
                    let idAviso = avisoCreado._id;
                    Preventiva.findByIdAndUpdate(nuevaPreventiva._id, {
                      aviso: idAviso
                    })
                      .then((preventivaSinActualizar) => {
                        res.redirect(`/tareas/${idIngreso}`);
                      })
                  })
              })
          })
      })
  } else if (subtareasPreventiva.length === 0) {
    res.render('tareas/nueva_preventiva', {
      preventivas,
      message: 'Debes seleccionar una subtarea como mínimo.'
    });
  } else if (!expresionRegularFecha.test(fechaPreventiva)) {
    res.render('tareas/nueva_preventiva', {
      preventivas,
      message: 'Introduce la fecha en el formato correcto.'
    });
  } else if (!expresionRegularKilometros.test(kilometrosPreventiva)) {
    res.render('tareas/nueva_preventiva', {
      preventivas,
      message: 'Introduce los kilómetros de forma correcta.'
    });
  }
})

router.get('/detallePreventiva/:id', (req, res) => {
  let idPreventiva = req.params.id;
  Preventiva.findById(idPreventiva)
    .then((preventivaEncontrada) => {
      preventivaSeleccionada = preventivaEncontrada;
      res.redirect('/pintarPreventiva');
    })
})

router.get('/pintarPreventiva', (req, res) => {
  let preventiva = preventivaSeleccionada;
  let frecuenciaMinuscula = preventiva.frecuencia.toLowerCase();
  obtenerPreventivasFrecuencia(preventiva.frecuencia);
  res.render('tareas/preventiva', {
    preventiva,
    frecuenciaMinuscula
  });
})

router.get('/modificarPreventiva', (req, res) => {
  let preventiva = preventivaSeleccionada;
  let preventivas = preventivasPeriodicidad;
  preventivas.map((unaPreventiva) => {
    if (preventiva.subtareas.includes(unaPreventiva[0])) {
      return unaPreventiva[1] = "checked";
    } else {
      return 0;
    }
  })
  res.render('tareas/modificar_preventiva', {
    preventiva,
    preventivas
  })
})

router.post('/modificarPreventiva', (req, res) => {
  let diasSiguientePreventiva = obtenerDiasSiguientePreventiva(preventivaSeleccionada.frecuencia);
  let preventiva = preventivaSeleccionada;
  let idPreventiva = preventivaSeleccionada._id;
  let frecuenciaMinuscula = preventiva.frecuencia.toLowerCase();
  let subtareasPreventiva = [];
  let listaSubtareas = req.body.subtareas
  if (listaSubtareas) {
    subtareasPreventiva = listaSubtareas;
  }
  let fechaPreventiva = req.body.fecha;
  let kilometrosPreventiva = req.body.kilometros;
  let observacionesPreventiva = req.body.observaciones;
  let preventivas = preventivasPeriodicidad;
  if (subtareasPreventiva.length !== 0 &&
    expresionRegularFecha.test(fechaPreventiva) &&
    expresionRegularKilometros.test(kilometrosPreventiva)) {
    Preventiva.findByIdAndUpdate(idPreventiva, {
      subtareas: subtareasPreventiva,
      fecha: fechaPreventiva,
      kilometros: kilometrosPreventiva,
      observaciones: observacionesPreventiva
    })
      .then((preventivaSinActualizar) => {
        Preventiva.findById(idPreventiva)
          .then((preventivaEncontrada) => {
            let preventiva = preventivaEncontrada;
            preventivaSeleccionada = preventiva;
            let nuevaFechaPreventiva = preventiva.fecha;
            Aviso.findByIdAndUpdate(
              preventiva.aviso,
              {
                fechaProximaPreventiva: moment(nuevaFechaPreventiva).add(diasSiguientePreventiva, 'day').format('YYYY-MM-DD')
              }
            )
              .then((avisoSinActualizar) => {
                res.render('tareas/preventiva', {
                  preventiva,
                  frecuenciaMinuscula
                });
              })
          })
      })
  } else if (subtareasPreventiva.length === 0) {
    res.render('tareas/modificar_preventiva', {
      preventiva,
      preventivas,
      message: 'Debes seleccionar una subtarea como mínimo.'
    });
  } else if (!expresionRegularFecha.test(fechaPreventiva)) {
    res.render('tareas/modificar_preventiva', {
      preventiva,
      preventivas,
      message: 'Introduce la fecha en el formato correcto.'
    });
  } else if (!expresionRegularKilometros.test(kilometrosPreventiva)) {
    res.render('tareas/modificar_preventiva', {
      preventiva,
      preventivas,
      message: 'Introduce los kilómetros de forma correcta.'
    });
  }
})

router.get('/confirmarBorradoPreventiva', (req, res) => {
  res.render('tareas/confirmar_borrado_preventiva');
})

router.get('/borrarPreventiva', (req, res) => {
  let idPreventiva = preventivaSeleccionada._id;
  let idIngreso = ingresoSeleccionado._id;
  Preventiva.findByIdAndDelete(idPreventiva)
    .then((preventivaEliminada) => {
      let idAviso = preventivaEliminada.aviso;
      Aviso.findByIdAndDelete(idAviso)
        .then((avisoBorrado) => { })
      Ingreso.findById(idIngreso)
        .then((ingresoEncontrado) => {
          preventivaSeleccionada = {};
          ingreso = ingresoEncontrado;
          idsPreventivasSinActualizar = ingreso.preventivas;
          idsPreventivasActualizado = [];
          idsPreventivasActualizado =
            idsPreventivasSinActualizar.filter(
              (id) => {
                return id.toString() !== idPreventiva.toString();
              }
            )
          Ingreso.findByIdAndUpdate(idIngreso, {
            preventivas: idsPreventivasActualizado,
            preventivaEnCurso: "no"
          })
            .then((ingresoSinActualizar) => {
              res.redirect(`/tareas/${idIngreso}`);
            })
        })
    })
})

router.get('/nuevaCorrectiva', (req, res) => {
  res.render('tareas/nueva_correctiva');
})

router.post('/nuevaCorrectiva', (req, res) => {
  let fechaTarea = req.body.fecha;
  let descripcionTarea = req.body.descripcion;
  let observacionesTarea = req.body.observaciones;
  if (expresionRegularDescripcion.test(descripcionTarea) &&
    expresionRegularFecha.test(fechaTarea)) {
    Correctiva.create({
      fecha: fechaTarea,
      descripcion: descripcionTarea,
      observaciones: observacionesTarea
    })
      .then((preventivaCreada) => {
        let nuevaCorrectiva = preventivaCreada;
        let idIngreso = ingresoSeleccionado._id;
        Ingreso.findByIdAndUpdate(idIngreso,
          { $push: { correctivas: nuevaCorrectiva } })
          .then((ingresoSinActualizar) => {
            res.redirect(`/tareas/${idIngreso}`);
          })
      })
  } else if (!expresionRegularFecha.test(fechaTarea)) {
    res.render("tareas/nueva_correctiva", {
      message: "Es obligatorio rellenar la fecha."
    });
  } else if (!expresionRegularDescripcion.test(descripcionTarea)) {
    res.render("tareas/nueva_correctiva", {
      message: "Es obligatorio rellenar el campo de descripción."
    });
  }
})

router.get('/detalleCorrectiva/:id', (req, res) => {
  let idCorrectiva = req.params.id;
  Correctiva.findById(idCorrectiva)
    .then((correctivaEncontrada) => {
      correctivaSeleccionada = correctivaEncontrada;
      res.redirect('/pintarCorrectiva');
    })
})

router.get('/pintarCorrectiva', (req, res) => {
  let correctiva = correctivaSeleccionada;
  res.render('tareas/correctiva', { correctiva });
})

router.get('/modificarCorrectiva', (req, res) => {
  let correctiva = correctivaSeleccionada;
  res.render('tareas/modificar_correctiva', { correctiva })
})

router.post('/modificarCorrectiva', (req, res) => {
  let idCorrectiva = correctivaSeleccionada._id;
  let fechaCorrectiva = req.body.fecha;
  let descripcionCorrectiva = req.body.descripcion;
  let observacionesPreventiva = req.body.observaciones;
  if (expresionRegularDescripcion.test(descripcionCorrectiva) &&
    expresionRegularFecha.test(fechaCorrectiva)) {
    Correctiva.findByIdAndUpdate(idCorrectiva, {
      fecha: fechaCorrectiva,
      descripcion: descripcionCorrectiva,
      observaciones: observacionesPreventiva
    })
      .then((correctivaSinActualizar) => {
        Correctiva.findById(idCorrectiva)
          .then((correctivaEncontrada) => {
            correctivaSeleccionada = correctivaEncontrada;
            res.redirect('/pintarCorrectiva');
          })
      })
  } else if (!expresionRegularFecha.test(fechaCorrectiva)) {
    let correctiva = correctivaSeleccionada;
    res.render("tareas/modificar_correctiva", {
      correctiva,
      message: "Es obligatorio rellenar la fecha."
    });
  } else if (!expresionRegularDescripcion.test(descripcionCorrectiva)) {
    let correctiva = correctivaSeleccionada;
    res.render("tareas/modificar_correctiva", {
      correctiva,
      message: "Es obligatorio rellenar el campo de descripción."
    });
  }
})

router.get('/confirmarBorradoCorrectiva', (req, res) => {
  res.render('tareas/confirmacion_borrado_correctiva');
})

router.get('/borrarCorrectiva', (req, res) => {
  let idCorrectiva = correctivaSeleccionada._id;
  let idIngreso = ingresoSeleccionado._id;
  Correctiva.findByIdAndDelete(idCorrectiva)
    .then((correctivaEliminada) => {
      Ingreso.findById(idIngreso)
        .then((ingresoEncontrado) => {
          correctivaSeleccionada = {};
          ingreso = ingresoEncontrado;
          idsCorrectivasSinActualizar = ingreso.correctivas;
          idsCorrectivasActualizado = [];
          idsCorrectivasActualizado =
            idsCorrectivasSinActualizar.filter(
              (id) => {
                return id.toString() !== idCorrectiva.toString();
              }
            )
          Ingreso.findByIdAndUpdate(idIngreso, {
            correctivas: idsCorrectivasActualizado,
          })
            .then((ingresoSinActualizar) => {
              res.redirect(`/tareas/${idIngreso}`);
            })
        })
    })
})

module.exports = router;
