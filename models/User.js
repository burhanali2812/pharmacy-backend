const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    contact : {type: String, required: true},
    role : {type: String, required: true, default: 'salesman'}, 
    joinedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model("User", userSchema);