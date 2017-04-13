var express = require('express');
var router = express.Router();

// Load models
var User = require('../models/user');
var Session = require('../models/session');
var session = new Session;
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

router.get('/logout', function(req, res) {
	req.session.reset()
	res.redirect("/users/login");
})

/*********************
// User Routes
/*********************/

router.get('/users/:id', function(req, res) {
    var callback = (err, result) => {
        if (err) {
            res.sendStatus(err.code);
            console.log(err);
        } else {
            if (result) {
                res.render('layouts/user_profile', result[0]);
                console.log(result);
            } else {
            	res.redirect("/login");
            }
        }
    }
    return user.get(req.params.id, req.session, callback);
});

router.post('/users/login', function(req, res) {
    var callback = (err, result) => {
        if (err) {
            res.sendStatus(err.code);
            console.log(err);
        } else {
            if (result.validated) {
                res.redirect("/users/" + req.session.user);
            } else {
                res.redirect("/login");
            }
        }
    }

    if (req.session.user) {
    	res.redirect("/users/" + req.session.user)
    } else {
    	return session.login(req.body.username, req.body.password, req.session, callback);
    }
});


router.post('/users/register', function(req, res) {
    var callback = (err, result) => {
        if (err) {
            res.sendStatus(err.code);
            console.log(err);
        } else {
            res.redirect("/users/" + result.insertId);
            console.log(result);
        }
    }
    return user.create(req.body, req.session, callback)
});

router.put('/users/:id', function(req, res) {
    var callback = (err, result) => {
        if (err) {
            res.sendStatus(err.code);
            console.log(err);
        } else {
            res.sendStatus(200);
            console.log(result);
        }
    }
    req.body.id = req.params.id;
    return user.update(req.body, callback)
});

module.exports = router;