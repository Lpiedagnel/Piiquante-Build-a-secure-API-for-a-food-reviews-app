const Sauce = require('../models/Sauce')
const User = require('../models/User')
const fs = require('fs')

// POST
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    delete sauceObject._userId
    let sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    sauce.save()
    .then(() => { res.status(201).json({message : "Sauce enregistrée !"})})
    .catch(error => { res.status(400).json({ error })})
}

// GET ONE
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce)
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            })
        }
    )
}

// GET ALL
exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces)
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            })
        }
    )
}

// PUT
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }

    delete sauceObject._userId
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({ message : 'Utilisateur non autorisé '})
        } else {
            Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({message: "Sauce modifiée !"}))
            .catch(error => res.status(401).json({ error }))
        }
    })
    .catch((error) => {
        res.status(400).json({ error })
    })
}

// DELETE
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({message: "Utilisateur non autorisé !"})
        } else {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({ message: "Sauce supprimée !"})})
                .catch(error => res.status(401).json({ error }))
            })
        }
    })
    .catch( error => {
        res.status(500).json({ error })
    })
}

exports.likeSauce = (req, res) => { // Peut-être regarder le Switch Case pour gérer ce cas de figure et raccourcir le code

    // Find sauce and creates variables
    Sauce.findOne({_id: req.params.id}) // Trouver l'explication de comment on récupère l'ID de la sauce
    .then((sauce) => {
        const userId = req.body.userId
        let likesCount = sauce.likes // Être plus clair dans le nom de la variable (likesCount)
        let dislikesCount = sauce.dislikes
        let usersLiked = sauce.usersLiked
        let usersDisliked = sauce.usersDisliked
        
        // Find if user already like
        let userAlreadyLike = usersLiked.includes(userId)
        let userAlreadyDislike = usersDisliked.includes(userId)

        // Add Like
        if (req.body.like === 1 && !userAlreadyLike) {
            likesCount += 1
            usersLiked.push(userId)
            sauce.updateOne({
                likes: likesCount,
                usersLiked: usersLiked
            })
            .then(() => console.log(`Valeur ajoutée. Le nombre de likes s'élève à ${likesCount} et les utilisateurs qui ont likés ont pour ID : ${usersLiked}`))
            .catch((err) => console.log(err))

        // Add dislike
        } else if (req.body.like === -1 && !userAlreadyDislike) {
            dislikesCount += 1
            usersDisliked.push(userId)
            sauce.updateOne({
                dislikes: dislikesCount,
                usersDisliked: usersDisliked
            })
            .then(() => console.log(`Valeur ajoutée. Le nombre de dislikes s'élève à ${dislikesCount} et les utilisateurs qui ont dislikés ont pour ID : ${usersDisliked}`))
            .catch((err) => console.log(err))

        // Delete like or dislike
        } else if (req.body.like === 0) {
            if (userAlreadyLike) {
                likesCount -= 1
                // Splice user
                for (let i = 0; i < usersLiked.length; i++) { // Enlever la boucle et utiliser directement le booléan
                    if (usersLiked[i] === userId) {
                        usersLiked.splice(i, 1)
                    }
                }
                // Update
                sauce.updateOne({
                    likes: likesCount,
                    usersLiked: usersLiked
                })
                .then(() => console.log(`Like enlevée. Le nombre de likes s'élève à ${likesCount} et les utilisateurs qui ont likés ont pour ID : ${usersLiked}`))
                .catch((err) => console.log(err))
            } else if (userAlreadyDislike) {
                dislikesCount -= 1
                // Splice user
                for (let i = 0; i < usersDisliked.length; i++) { // Enlever la boucle et utiliser directement le booléan
                    if (usersDisliked[i] === userId) {
                        usersDisliked.splice(i, 1)
                        i--
                    }
                }
                // Update
                sauce.updateOne({
                    dislikes: dislikesCount,
                    usersDisliked: usersDisliked
                })
                .then(() => console.log(`Dislike retirée. Le nombre de dislikes s'élève à ${dislikesCount} et les utilisateurs qui ont dislikés ont pour ID : ${usersDisliked}`))
                .catch((err) => console.log(err))
            }
        // If the user already submit
        } else {
            console.log('The user already submit his review')  // Mettre un res.status(500)
        }
        res.status(200).json({ message: "The user click on the like or dislike button" })
    })
    .catch((err) => res.status(404).json({ err }))
}
