const mongoose = require('mongoose');

const prayerSchema = mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous'
    },
    message: {
        type: String,
        required: [true, 'Please add a prayer request']
    },
    amenCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prayer', prayerSchema);
