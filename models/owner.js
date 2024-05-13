const mongoose = require('mongoose')

const ownerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },

    number: {
        type: String,
        validate: {
            validator: function (v) {
                var re = /^\d{10}$/;
                return (!v || !v.trim().length) || re.test(v)
            },
            message: 'Provided phone number is invalid.'
        }
    },
})

module.exports = mongoose.model('Owner', ownerSchema)