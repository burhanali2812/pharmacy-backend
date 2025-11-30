const jwt = require('jsonwebtoken')
const User = require('../models/User')
require("dotenv").config();

const userAuthrization = async (req, res, next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];

            const decode = jwt.verify(token, process.env.SECRET_KEY);
            req.user = await User.findById(decode.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Unauthorized: Invalid Token" });
        }
    }
    if(!token){
        res.status(401).json({ message: "Unauthorized: No Token" });
    }
};
module.exports = userAuthrization;