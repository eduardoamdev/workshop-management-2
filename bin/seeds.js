require("dotenv").config();

const mongoose = require("mongoose");

const TipoVehiculo = require("../models/tipoVehiculo");
const GrupoCia = require("../models/grupoCia");
const TareaPreventiva = require("../models/tareaPreventiva");


mongoose
  .connect(`mongodb://localhost/${process.env.DB_CONFIG}`, { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });


let tiposVehiculo = [
  {
    nombre: "MB Vito 109 CDI",
    noc: "2310-33-203-7851"
  },
  {
    nombre: "Peugeot 307 XT HDI",
    noc: "2310-33-204-7663"
  },
  {
    nombre: "Ambulancia MB 209 CDI",
    noc: "2310-33-205-7052"
  },
  {
    nombre: "Peugeot Partner",
    noc: "2310-33-207-1926"
  },
  {
    nombre: "CNLTT 4TM Iveco 7217/6",
    noc: "2320-33-105-7756"
  },
  {
    nombre: "CNLTT 4TM Pegaso 7226 CDI",
    noc: "2320-33-203-0008"
  },
  {
    nombre: "CNLTT 1TM Santana Anibal",
    noc: "2320-33-203-8996"
  },
  {
    nombre: "CNLTT 1TM Santana Anibal T Rigido 8P",
    noc: "2320-33-205-5383"
  },
  {
    nombre: "RQ 2TM Marzasa M20A",
    noc: "2330-33-205-1447"
  },
  {
    nombre: "RQ 1/2TM Marzasa",
    noc: "2330-33-206-8112"
  },
  {
    nombre: "Carret Elev 2,5TM Caterpillar EP25k",
    noc: "3930-17-120-2658"
  },
  {
    nombre: "CNLTT 1,5TM Ambulancia Iveco 40.10 WM",
    noc: "2310-33-105-7755"
  },
  {
    nombre: "CNLTT 1,5TM Ambulancia Iveco 40.13 WM",
    noc: "2310-33-206-0866"
  },
  {
    nombre: "Veterinaria Peugeot Expert",
    noc: "2310-33-206-4918"
  },
  {
    nombre: "CNLTT 1,5TM Ambulancia SVA Iveco 40E15 WM",
    noc: "2310-33-T09-3833"
  },
  {
    nombre: "Plat Vempar Mixta",
    noc: "3990-33-200-3475"
  },
  {
    nombre: "CNLTT 1TM Santana Anibal T Lona",
    noc: "2320-33-205-5301"
  },
  {
    nombre: "CNLTT 1TM Veterniaria Santana Anibal",
    noc: "2355-33-206-7543"
  },
  {
    nombre: "CNPTT 10TM Iveco M250.37W",
    noc: "2320-33-005-0943"
  },
  {
    nombre: "CNPTT 10TM Iveco M250.37W Cabrest",
    noc: "2320-33-005-0946"
  },
  {
    nombre: "Lab Veterinario C/L 3TM Nissan M-110",
    noc: "2320-33-179-5676"
  },
  {
    nombre: "CNPTT 10TM Iveco M250.40W Caja Marzasa",
    noc: "2320-33-203-0010"
  },
  {
    nombre: "C/P 15TM Vempar Iveco AD410T45",
    noc: "2320-33-212-0166"
  },
  {
    nombre: "Plat Vempar polivalente",
    noc: "3990-33-207-6769"
  },
  {
    nombre: "RQ 1/4TM Rigual REM-500",
    noc: "2330-33-179-6001"
  },
  {
    nombre: "RQ 15TM SMIC Vempar Log DANIMA",
    noc: "2320-33-207-5385"
  },
  {
    nombre: "RQ 2TM Aljibe 1800L Marzasa M20-BJ",
    noc: "2330-33-213-4137"
  },
  {
    nombre: "RQ 1,8TM 2 ejes incinerador tecnove I8-55A",
    noc: "4540-33-213-6453"
  },
  {
    nombre: "GE RQ Gesan DPS-20M",
    noc: "2330-33-T00-2094"
  },
  {
    nombre: "GE RQ 57KVA IBERICA IRG-2200",
    noc: "6115-33-205-6457"
  },
  {
    nombre: "CNLTT 1,5TM Ambulancia Iveco 40E13 WM",
    noc: "2310-33-202-3692"
  },
  {
    nombre: "CNLTT 1,5TM Ambulancia SVA Iveco 40.13 WM",
    noc: "2310-33-206-1030"
  },
  {
    nombre: "Farmacia CNMTT 1,5TM Iveco 40.13 EM",
    noc: "2310-33-208-0707"
  },
  {
    nombre: "CNLTT 1,5TM Ambulancia BT Iveco M 40E15 WM",
    noc: "2310-33-209-4002"
  },
  {
    nombre: "CNPTT 10TM Iveco m250.40W PBLN",
    noc: "2320-33-206-5148"
  },
  {
    nombre: "Plat Vempar Auton Aljibe 10000L",
    noc: "2330-33-005-4593"
  }
];

let gruposCias = [
  {
    nombre: "Grupo III"
  },
  {
    nombre: "Grupo IV"
  },
  {
    nombre: "Cia Servicos"
  }
]

let tareasPreventivas = [
  {
    periodicidad: "Anual",
    descripcion: "SUSTITUCIÓN ACEITE MOTOR Y FILTRO"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN FILTRO DE AIRE"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN CONTROL VISUAL Y FUNCIONAMIENTO DE LA TRANSMISIÓN"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN DISCOS Y PASTILLAS DE FRENO"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN LIQUIDO HIDRAÚLICO DE LA SERVODIRECCIÓN"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN NEUMÁTICOS Y RUEDAS"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN DISCOS DE RUEDA"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN CONTROL VISUAL FRENOS, SUSPENSIÓN, DIRECCIÓN Y RUEDAS"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN EQUIPO ÓPTICO, ACÚSTICO Y CABLEADO"
  },
  {
    periodicidad: "Anual",
    descripcion: "INSPECCIÓN GANCHOS DE REMOLQUE Y ANILLAS DE ELEVACIÓN TRASERAS"
  },
  {
    periodicidad: "Bienal",
    descripcion: "SUSTITUCIÓN DEL FILTRO DEL AIRE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "SUSTITUCIÓN DEL FILTRO DE COMBUSTIBLE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "SUSTITUCIÓN DEL PREFILTRO DE COMBUSTIBLE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "SUSTITUCIÓN DEL LÍQUIDO DE FRENOS"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN CORREAS DE MANDO"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN RADIADOR DE AGUA"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN RADIADOR DE AIRE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN SISTEMA DE ESCAPE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN CONTROL VISUAL DEL MOTOR"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN LINEA DE COMBUSTIBLE Y CONEXIONES"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN LÍQUIDO DE EMBRAGUE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN PEDAL DE EMBRAGUE"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN FRENO DE MANO"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN MECANISMOS DE DIRECCIÓN"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN AMORTIGUADORES, SILENTBLOCKS Y BALLESTAS"
  },
  {
    periodicidad: "Bienal",
    descripcion: "INSPECCIÓN CERRADURAS Y BISAGRAS"
  },
  {
    periodicidad: "Trienal",
    descripcion: "SUSTITUCIÓN ACEITE DE CAJA DE CAMBIOS"
  },
  {
    periodicidad: "Trienal",
    descripcion: "INSPECCIÓN ACEITE CAJA DE TRANSFERENCIA"
  },
  {
    periodicidad: "Trienal",
    descripcion: "INSPECCIÓN ACEITE GRUPOS DIFERENCIALES"
  },
  {
    periodicidad: "Trienal",
    descripcion: "INSPECCIÓN ARBOLES DE TRANSMISIÓN"
  },
  {
    periodicidad: "Trienal",
    descripcion: "INSPECCIÓN GRASA PIVOTE DE DIRECCIÓN"
  },
  {
    periodicidad: "Cuatrienal",
    descripcion: "SUSTITUCIÓN REFRIGERANTE DEL MOTOR"
  },
  {
    periodicidad: "Cuatrienal",
    descripcion: "SUSTITUCIÓN DEL FILTRO DE LÍQUIDO HIDRAÚLICO DE LA SERVODIRECCIÓN"
  },
  {
    periodicidad: "Cuatrienal",
    descripcion: "SUSTITUCIÓN DEL LÍQUIDO HIDRAÚLICO DE LA SERVODIRECCIÓN"
  },
  {
    periodicidad: "Cuatrienal",
    descripcion: "INSPECCIÓN DEPÓSITO DE COMBUSTIBLE"
  },
  {
    periodicidad: "Cuatrienal",
    descripcion: "INSPECCIÓN BASTIDOR Y SILENTBLOCKS DE APOYO DE CARROCERÍA"
  },
  {
    periodicidad: "Sexenal",
    descripcion: "SUSTITUCIÓN CORREAS DE MANDO Y RODILLOS TENSORES DISTRIBUCIÓN"
  }
]


TipoVehiculo.deleteMany()
  .then(() => {
    return TipoVehiculo.create(tiposVehiculo);
  })
  .then(tiposCreados => {
    console.log(`${tiposCreados.length} tipos de vehículo creados con los siguientes nombres:`);
    console.log(tiposCreados.map(tipo => tipo.nombre));
  })
  .then(() => {
    mongoose.disconnect();
  })
  .catch(err => {
    mongoose.disconnect();
    throw err;
  });

GrupoCia.deleteMany()
  .then(() => {
    return GrupoCia.create(gruposCias);
  })
  .then(gruposCiasCreados => {
    console.log(`${gruposCiasCreados.length} grupos creados con los siguientes nombres:`);
    console.log(gruposCiasCreados.map(grupo => grupo.nombre));
  })
  .then(() => {
    mongoose.disconnect();
  })
  .catch(err => {
    mongoose.disconnect();
    throw err;
  });

TareaPreventiva.deleteMany()
  .then(() => {
    return TareaPreventiva.create(tareasPreventivas);
  })
  .then(tareasPreventivasCreadas => {
    console.log(`${tareasPreventivasCreadas.length} tareas preventivas creadas.`);
  })
  .then(() => {
    mongoose.disconnect();
  })
  .catch(err => {
    mongoose.disconnect();
    throw err;
  });
