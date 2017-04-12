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
	var callback = (err, result) => {
		if(err) {
			res.sendStatus(err.code);
			console.log(err);
		} else {
			res.sendStatus(200);
			console.log(result);
		}
	}
	return user.get(req.params.id, callback);
})

router.post('/users/register', function(req, res) {
	var callback = (err, result) => {
		if(err) {
			res.sendStatus(err.code);
			console.log(err);
		} else {
			res.sendStatus(200);
			console.log(result);
		}
	}
	return user.create(req.body, callback)
})

router.put('/users/:id', function(req, res) {
	var callback = (err, result) => {
		if(err) {
			res.sendStatus(err.code);
			console.log(err);
		} else {
			res.sendStatus(200);
			console.log(result);
		}
	}
	req.body.id = req.params.id;
	return user.update(req.body, callback)
})

module.exports = router;