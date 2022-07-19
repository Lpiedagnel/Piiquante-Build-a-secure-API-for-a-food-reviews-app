const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const User = require('../models/User')

exports.signup = async (req, res) => {
    // our register logic goes here...
    try {
        // Get user Input
        const { email, password } = req.body

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required")
        }

        // Check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email })

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login")
        }

        // Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10)

        // Create user in our database
        const user = await User.create({
            email: email.toLowerCase(),
            password: encryptedPassword,
        })

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email},
            process.env.TOKEN_KEY,
            {
                expiresIn: "24h",
            }
        )
        // Save user token
        user.token = token

        // Return new user
        res.status(201).json(user)

        // Send error if try fail
    } catch (err) {
        console.log(err)
    }
}

exports.login = async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required")
        }

        // Validate if user exist in our database
        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                {user_id: user_id, email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "24H"
                }
            )

            // Save user token
            user.token = token

            // user
            res.status(200).json(user)
        } // If credentials wrong
        res.status(400).send("Invalid Credentials")

    // Send error if try failed
    } catch (err) {
        console.log(err)
    }
}