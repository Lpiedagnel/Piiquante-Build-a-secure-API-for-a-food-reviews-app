const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cryptoJs = require('crypto-js')
const User = require('../models/User')
require('dotenv').config()

// Register the user in the database
exports.signup = (req, res, next) => {
    // Encrypt email
    const emailCryptosJs = cryptoJs.HmacSHA256(req.body.email, process.env.CRYPTO_KEY).toString()
    // Encrypt password
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: emailCryptosJs,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }))
      })
      .catch(error => res.status(500).json({ error }))
}

// Find user in the database and login it
exports.login = (req, res, next) => {
    const emailCryptosJs = cryptoJs.HmacSHA256(req.body.email, process.env.CRYPTO_KEY).toString()
    User.findOne({ email: emailCryptosJs })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_KEY,
                            { expiresIn: '24h' }
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }))
        })
    .catch(error => res.status(500).json({ error }))
}