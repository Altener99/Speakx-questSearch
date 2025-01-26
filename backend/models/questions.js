const mongoose = require('mongoose');

const questionsSchema = new mongoose.Schema({

    title:String,
    type:String

});

module.exports = mongoose.model('Questions',questionsSchema);
