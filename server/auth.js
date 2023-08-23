const express = require('express')
const jwt = require('jsonwebtoken')
const secret_key = "secret_key";

module.exports = {
    auth: (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if(!authHeader)
            return res.status(403).json({msg: "authentication required"});

        const decoded = jwt.verify(authHeader, secret_key);
        if(decoded && decoded.id)
            next();
        else
            return res.status(403).json({msg: "Incorrect token"});
    }
}
