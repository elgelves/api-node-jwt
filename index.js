const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config()

const app = express();

// cors
const cors = require('cors');
var corsOptions = {
    origin: '*', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));


// capturar body
app.use(bodyparser.urlencoded({ extended: false}));
app.use(bodyparser.json());

// conexion a la BD
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.myp6xaa.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))

// Importar rutas
const authRoutes = require('./routes/auth');
const validateToken = require('./routes/validate-token');
const admin = require('./routes/admin');

// route middlewares
app.use('/api/user', authRoutes);
app.use('/api/admin', validateToken, admin);
app.get('/', (req, res)=>{
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});

//Iniciar servidor

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
    console.log(`servidor escuchando en el puerto: ${PORT}`)
});

