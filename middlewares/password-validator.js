const passwordValidator = require('password-validator');

// Create a schema to verify password and add properties to it
const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(5)                                    // Minimum length 5
    .is().max(35)                                   // Maximum length 35
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(1)                                // Must have at least 1 digit
    .has().not().spaces()                           // Should not have spaces
    .has().not().symbols()                          // Should not have symbol

// Export verification
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)) {
        next()
    } else {
        return res.status(400).json({error : `Le mot de passe doit contenir entre 5 et 35 caractères, une lettre majuscule, une lettre minuscule et un chiffre, et ne doit pas contenir d\'espace, ni de symbole. Le problème vient de ${passwordSchema.validate(req.body.password, { list: true })}`})
    }
}