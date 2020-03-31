"use strict";
const express = require('express');
const router = express.Router();
/* GET home page. */

function isAuthenticated(req, res, next) {
    if (req.user && req.isAuthenticated()) {
      return next();
    }
  
    return res.redirect('/login');
  }
  
router.get('/', isAuthenticated, (request, response) => {
    response.render('login');
  });