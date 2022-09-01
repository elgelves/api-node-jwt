const router = require('express').Router();
const User = require('../models/User');

const bcrypt = require('bcrypt');

const Joi = require('@hapi/joi');

const jwt = require('jsonwebtoken');

const schemaRegister = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});

    // configurar para JWT

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});

router.post('/login', async (req, res) =>{
    const {error} = schemaLogin.validate(req.body);
    if(error) return res.status(400).json({ error: error.details[0].message});

    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).json({ error: true, message: 'email no registrado' });

    const passValidate = await bcrypt.compare(req.body.password, user.password);
    if(!passValidate) return res.status(400).json({ error: true, message: 'contraseña invalida' });

    // configuracion de JWT

    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET);

    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })
});

router.post('/register', async (req, res) => {

    // validaciones del usuario

    const {error} = schemaRegister.validate(req.body);
    if(error){
        return res.status(400).json({ error: error.details[0].message });
    }

    // para email unico

    const emailUnique = await User.findOne({email: req.body.email});
    if(emailUnique) return res.status(400).json({ error: true, message: 'email ya registrado' });
    
    // hash de contraseña para encriptacion

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    })
    try {
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser
        })
    } catch (error) {
        res.status(400).json({error})
    }
})

module.exports = router;