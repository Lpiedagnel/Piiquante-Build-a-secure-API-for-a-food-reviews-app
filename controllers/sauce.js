const Sauce = require('../models/Sauce')
const User = require('../models/User')
const fs = require('fs')
const { body, validationResult } = require('express-validator')

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

exports.likeSauce = (req, res) => {

    // Find sauce and creates variables
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        const userId = req.body.userId
        let likesCount = sauce.likes
        let dislikesCount = sauce.dislikes
        let usersLiked = sauce.usersLiked
        let usersDisliked = sauce.usersDisliked
        
        // Find if user already like
        let userAlreadyLike = usersLiked.includes(userId)
        let userAlreadyDislike = usersDisliked.includes(userId)

        switch (true) {
            // Add Like
            case (req.body.like === 1 && !userAlreadyLike) :
                likesCount += 1
                usersLiked.push(userId)
                sauce.updateOne({
                    likes: likesCount,
                    usersLiked: usersLiked
                })
                .then(() => console.log(`Valeur ajoutée. Le nombre de likes s'élève à ${likesCount} et les utilisateurs qui ont likés ont pour ID : ${usersLiked}`))
                .catch((err) => console.log(err))
                break

            // Add dislike
            case (req.body.like === -1 && !userAlreadyDislike) :
                dislikesCount += 1
                usersDisliked.push(userId)
                sauce.updateOne({
                    dislikes: dislikesCount,
                    usersDisliked: usersDisliked
                })
                .then(() => console.log(`Valeur ajoutée. Le nombre de dislikes s'élève à ${dislikesCount} et les utilisateurs qui ont dislikés ont pour ID : ${usersDisliked}`))
                .catch((err) => console.log(err))
                break

            // Delete Like
            case (req.body.like === 0 && userAlreadyLike) :
                likesCount -= 1
                // Splice user
                usersLiked.splice(usersLiked.indexOf(userId), 1)
                // Update
                sauce.updateOne({
                    likes: likesCount,
                    usersLiked: usersLiked
                })
                .then(() => console.log(`Like enlevée. Le nombre de likes s'élève à ${likesCount} et les utilisateurs qui ont likés ont pour ID : ${usersLiked}`))
                .catch((err) => console.log(err))
                break

            // Delete dislike
            case (req.body.like === 0 && userAlreadyDislike) :
                dislikesCount -= 1
                // Splice user
                usersDisliked.splice(usersDisliked.indexOf(userId), 1)
                // Update
                sauce.updateOne({
                    dislikes: dislikesCount,
                    usersDisliked: usersDisliked
                })
                .then(() => console.log(`Dislike retirée. Le nombre de dislikes s'élève à ${dislikesCount} et les utilisateurs qui ont dislikés ont pour ID : ${usersDisliked}`))
                .catch((err) => console.log(err))
                break

            default: 
                res.status(500).console.log('The user already submit his review')
        }
        res.status(200).json({ message: "The user click on the like or dislike button" })
    })

    // Fail to find the sauce
    .catch((err) => res.status(404).json({ err }))
}