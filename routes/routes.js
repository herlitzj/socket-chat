var express = require('express');
var router = express.Router();

// Load models
var User = require('../models/user');
var user = new User;

/*********************
// General Routes
/*********************/
router.get('/', function(req, res) {
    res.render('layouts/landing')
});

router.get('/chat', function(req, res) {
    res.render('chat');
});

router.get('/login', function(req, res) {
    res.render('login');
});

/*********************
// User Routes
/*********************/
router.get('/users/:id', function(req, res) {
	return user.get(req.id);
})

router.post('/users/register', function(req, res) {
	return user.create(req.body)
})

router.put('/users/:id', function(req, res) {
	return user.update(req.body)
})

module.exports = router;