const express = require('express');
const jwt = require('jsonwebtoken')
const secret_key = "secret_key"; 

module.exports = {
    admin: (req, res, next) => {
        const adminHeader = req.headers["authorization"];
        if(!adminHeader)
            return res.status(403).json({msg: "authentication required"});
        const decoded = jwt.verify(adminHeader, secret_key);
        if(decoded.role === "admin")
            next();
        else 
            return res.status(403).json({msg: "Not An Admin"});
    }
}
