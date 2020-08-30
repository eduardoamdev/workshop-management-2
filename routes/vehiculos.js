const express = require('express');
const router = express.Router();


const Vehiculo = require('../models/vehiculo');
const TipoVehiculo = require("../models/tipoVehiculo");
const GrupoCia = require("../models/grupoCia");
const Ingreso = require("../models/ingreso");
const Preventiva = require("../models/preventiva");
const Correctiva = require("../models/correctiva");
const Repuesto = require("../models/repuesto");
const Aviso = require('../models/aviso');


const expresionRegularMatricula = /ET-[0-9]{6,6}$/;
const expresionRegularMatriculaRemolque = /ET-[0-9]{6,6}-R$/;

let vehiculoCompleto = {};

function tiposGruposRender(respuesta, mensaje, ruta) {
  TipoVehiculo.find()
    .then((tipos) => {
      let tiposVehiculos = tipos;
      GrupoCia.find()
        .then((grupos) => {
          let gruposCias = grupos;
          respuesta.render(ruta,
            {
              message: mensaje,
              tiposVehiculos,
              gruposCias
            });
        })
    })
}

router.get('/nuevoVehiculo', (req, res) => {
  TipoVehiculo.find()
    .then((tipos) => {
      let tiposVehiculos = tipos;
      GrupoCia.find()
        .then((grupos) => {
          let gruposCias = grupos;
          res.render('vehiculos/nuevoVehiculo',
            { tiposVehiculos, gruposCias });
        })
    })
})

router.post('/nuevoVehiculo', (req, res) => {
  let matriculaVehiculo = req.body.matricula.toUpperCase();
  let tipoVehiculo = req.body.tipo;
  let grupoVehiculo = req.body.grupo;
  let vehiculoExistente = null;
  if (expresionRegularMatricula.test(matriculaVehiculo) ||
    expresionRegularMatriculaRemolque.test(matriculaVehiculo)) {
    Vehiculo.find()
      .then((vehiculos) => {
        vehiculos.map((vehiculo) => {
          if (vehiculo.matricula === matriculaVehiculo) {
            vehiculoExistente = vehiculo;
          }
        })
        if (vehiculoExistente === null) {
          Vehiculo.create({
            matricula: matriculaVehiculo,
            tipo: tipoVehiculo,
            grupoCia: grupoVehiculo
          })
            .then((nuevoVehiculo) => {
              let vehiculoCreado = nuevoVehiculo;
              TipoVehiculo.find({ nombre: vehiculoCreado.tipo })
                .then((tipo => {
                  let nocTipo = tipo[0].noc;
                  Vehiculo.findByIdAndUpdate(
                    vehiculoCreado._id,
                    { noc: nocTipo }
                  )
                    .then((vehiculo) => {
                      Vehiculo.find({ _id: vehiculo._id })
                        .then((vehiculoActualizado) => {
                          let vehiculoCompleto = vehiculoActualizado[0];
                          res.render(
                            'vehiculos/confirmacion_nuevo_vehiculo',
                            { vehiculoCompleto }
                          )
                        })
                    })
                }))
            })
        } else {
          tiposGruposRender(
            res,
            'Ya existe un vehículo con esa matrícula.',
            'vehiculos/nuevoVehiculo'
          );
        }
      })
  } else {
    tiposGruposRender(
      res,
      'Introduce la matrícula en el formato correcto.',
      'vehiculos/nuevoVehiculo'
    );
  }
})

router.get('/todosLosVehiculos', (req, res) => {
  Vehiculo.find()
    .then((vehiculosEncontrados) => {
      let vehiculos = vehiculosEncontrados;
      vehiculos.sort((a, b) => {
        if (a.grupoCia < b.grupoCia)
          return -1;
        if (a.grupoCia > b.grupoCia)
          return 1;
        return 0;
      })
      res.render('vehiculos/todos_los_vehiculos', {
        vehiculos
      });
    })
})

router.get('/vehiculosIngresados', (req, res) => {
  Vehiculo.find({ ingresadoActualmente: "si" })
    .then((vehiculos) => {
      let vehiculosIngresados = vehiculos;
      vehiculos.sort((a, b) => {
        if (a.tipo < b.tipo)
          return -1;
        if (a.tipo > b.tipo)
          return 1;
        return 0;
      })
      res.render('vehiculos/vehiculos_ingresados', {
        vehiculosIngresados
      });
    })
})

router.get('/buscarVehiculo', (req, res) => {
  res.render('vehiculos/buscar_vehiculo');
})

router.post('/buscarVehiculo', (req, res) => {
  let matriculaVehiculo = req.body.matricula.toUpperCase();
  if (expresionRegularMatricula.test(matriculaVehiculo) ||
    expresionRegularMatriculaRemolque.test(matriculaVehiculo)) {
    Vehiculo.find({ matricula: matriculaVehiculo })
      .then((vehiculoEncontrado) => {
        if (vehiculoEncontrado.length !== 0) {
          let vehiculo = vehiculoEncontrado[0];
          res.render(
            'vehiculos/vehiculo_encontrado',
            { vehiculo }
          )
        } else {
          tiposGruposRender(
            res,
            'La matrícula no pertenece a ningún vehículo.',
            'vehiculos/buscar_vehiculo'
          );
        }
      })
  } else {
    tiposGruposRender(
      res,
      'Introduce la matrícula en el formato correcto.',
      'vehiculos/buscar_vehiculo'
    );
  }
})

router.get('/detalleVehiculo/:id', (req, res) => {
  let idVehiculo = req.params.id;
  Vehiculo.findById(idVehiculo)
    .then((vehiculoEncontrado) => {
      vehiculoCompleto = vehiculoEncontrado;
      res.redirect('/pintarVehiculo');
    })
})

router.get('/pintarVehiculo', (req, res) => {
  let vehiculo = vehiculoCompleto;
  res.render('vehiculos/vehiculo', { vehiculo });
})

router.get('/modificarVehiculo', (req, res) => {
  let vehiculo = vehiculoCompleto;
  TipoVehiculo.find()
    .then((tipos) => {
      let tiposVehiculos = tipos;
      GrupoCia.find()
        .then((grupos) => {
          let gruposCias = grupos;
          res.render(
            'vehiculos/modificar_vehiculo',
            { vehiculo, tiposVehiculos, gruposCias }
          );
        })
    })
})

router.post('/modificarVehiculo', (req, res) => {
  let matriculaVehiculo = req.body.matricula.toUpperCase();
  let tipoVehiculo = req.body.tipo;
  let grupoVehiculo = req.body.grupo;
  let vehiculoExistente = null;
  let idVehiculo = vehiculoCompleto._id;
  if (expresionRegularMatricula.test(matriculaVehiculo) ||
    expresionRegularMatriculaRemolque.test(matriculaVehiculo)) {
    Vehiculo.find()
      .then((vehiculos) => {
        let todosLosVehiculos = vehiculos;
        let vehiculosSinActual = [];
        vehiculosSinActual = todosLosVehiculos.filter((vehiculo) => {
          return vehiculo._id.toString() !== vehiculoCompleto._id.toString();
        })
        vehiculosSinActual.map((vehiculo) => {
          if (vehiculo.matricula === matriculaVehiculo) {
            vehiculoExistente = vehiculo;
          }
        })
        if (vehiculoExistente === null) {
          Vehiculo.findByIdAndUpdate(idVehiculo, {
            matricula: matriculaVehiculo,
            tipo: tipoVehiculo,
            grupoCia: grupoVehiculo
          })
            .then((vehiculoSinActualizar) => {
              Vehiculo.findById(idVehiculo)
                .then((vehiculoActualizado) => {
                  let vehiculo = vehiculoActualizado;
                  vehiculoCompleto = vehiculoActualizado;
                  Aviso.find()
                    .then((todosLosAvisos) => {
                      let avisos = todosLosAvisos;
                      let avisosVehiculo = [];
                      avisos.map((cadaAviso) => {
                        if (cadaAviso.vehiculo === vehiculoSinActualizar.matricula) {
                          avisosVehiculo.push(cadaAviso);
                        }
                      })
                      avisosVehiculo.map((cadaAvisoVehiculo) => {
                        Aviso.findByIdAndUpdate(
                          cadaAvisoVehiculo._id,
                          {
                            vehiculo: vehiculo.matricula
                          }
                        )
                          .then((avisoSinActualizar) => { })
                      })
                      res.render(
                        'vehiculos/vehiculo',
                        { vehiculo }
                      );
                    })
                })
            })
        } else {
          let vehiculo = vehiculoCompleto;
          TipoVehiculo.find()
            .then((tipos) => {
              let tiposVehiculos = tipos;
              GrupoCia.find()
                .then((grupos) => {
                  let gruposCias = grupos;
                  res.render(
                    'vehiculos/modificar_vehiculo',
                    {
                      vehiculo,
                      tiposVehiculos,
                      gruposCias,
                      message: "Ya existe un vehículo con esa matrícula."
                    }
                  );
                })
            })
        }
      })
  } else {
    let vehiculo = vehiculoCompleto;
    TipoVehiculo.find()
      .then((tipos) => {
        let tiposVehiculos = tipos;
        GrupoCia.find()
          .then((grupos) => {
            let gruposCias = grupos;
            res.render(
              'vehiculos/modificar_vehiculo',
              {
                vehiculo,
                tiposVehiculos,
                gruposCias,
                message: "Introduce la matrícula en el formato correcto."
              }
            );
          })
      })
  }
})

router.get('/confirmacionBorradoVehiculo', (req, res) => {
  res.render('vehiculos/confirmacion_borrado_vehiculo');
})

router.get('/borrarVehiculo', (req, res) => {
  let idVehiculo = vehiculoCompleto._id;
  Vehiculo.findByIdAndDelete(idVehiculo)
    .then((vehiculoBorrado) => {
      let idsIngresos = vehiculoBorrado.ingresos;
      if (idsIngresos.length !== 0) {
        idsIngresos.forEach((id) => {
          Ingreso.findByIdAndDelete(id)
            .then((ingresoBorrado) => {
              let ingresoEliminado = ingresoBorrado;
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
            })
        })
      }
      vehiculoCompleto = {};
      res.redirect('/todosLosVehiculos');
    })
})

module.exports = router;
