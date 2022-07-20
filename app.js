require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const mongoString = process.env.DATABASE_URL

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const { application } = require('express');


mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected')
})
const app = express()

app.use(express.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
})

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})

app.use('/api/auth', userRoutes)
app.use('/api/sauces', sauceRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app