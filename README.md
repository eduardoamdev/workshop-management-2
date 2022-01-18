# Workshop Management 2

## Descripción:

Este proyecto está siendo utilizado en red local por la Agrupación Sanitaria número 3 de Zaragoza y es una mejora una mejora de "Workshop-management-1" ya que incluye ciertas tareas automatizadas y avisa al usuario de manera de ciertos eventos con una frecuencia que puede ser programada directamente.

Consiste en una aplicación que permite gestionar órdenes de trabajo en un taller y, además, programar revisiones para fechas determinadas.

## Tecnologías empleadas:

### NodeJS:

El lenguaje de programación empleado para el servidor es NodeJS que no es más que un entorno de ejecución para Javascript.

### Express:

Para levantar el servidor utilizamos Express. Este paquete de software nos permite levantar un servidor con muy pocas líneas de código y nos ahorra tener que utilizar la librería http de NodeJS, con la cual el trabajo sería bastante más complejo.

### MongoDB:

Como base de datos empleamos MongoDB. Esta base de datos va a ser instalada en el mismo servidor que el resto del proyecto.

### Mongoose:

El software mediante el cual nos comunicamos con la base de datos es Mongoose. Este conjunto de librerías nos ayuda a hacer peticiones a la base de datos por mediación de los modelos.

### Dotenv:

Para crear y gestionar variables de entorno empleamos Dotenv. Con este módulo podremos, mediante la creación de un archivo .env, generar variables de entorno que se encontrarán en el global scope de nuestro proyecto.

### Handlebars:

Dentro de este proyecto tendrá una importancia vital Handlebars. Este módulo es un motor de renderizado de plantillas que nos va a permitir realizar los renderizados desde nuestro back-end.

### MomentJS:

MomentJS es la librería que nos facilita un labor en ocasiones tan compleja como la gestión de fechas, algo de gran importancia dentro de este proyecto.

## Cómo arrancar este proyecto:

Para poner en marcha el proyecto debemos disponer de una base de datos local o remota cuya conexión pasar como argumento del método connect de mongoose y definir el puerto en el que vamos a arrancar la aplicación.

Tanto la conexión con la base de datos como el puerto los podemos guardar en un archivo .env cuyo contenido requeriremos cuando lo necesitemos.

## ¿Qué me ha aportado este proyecto?

Este proyecto me aportó nuevos conocimientos como pueden ser lo relativo al trabajo con fechas y la utilización de fuentes importadas para mis estilos CSS. También tengo que recarcar que tanto con este proyecto como con el anterior, Workshop management 1, aprendí mucho acerca de trabajo con servidores ya que ambos se encuentran desplegados en una Rapsberry Py funcionando de manera local. Para manejar la Rapsberry Py le instalé ubuntu server como sistema operativo y tranferí los datos mediante el protocolo SSH.

No hacía tanto que había salido de mi formación cuando decidí embarcarme en estos proyectos y tengo que decir que han supuesto un reto importante y me han ayudado a consolidar y ampliar todos los conocimientos adquiridos previamente.
