let express     = require('express');
let app         = express();
let bodyParser  = require('body-parser');
let morgan      = require('morgan');
let mongoose    = require('mongoose');
let util = require('util');







let config = require('./config'); // get our config file


var auth = require('./controllers/auth');
var requests = require('./controllers/requests');


var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
//app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.listen(port);
console.log('listening at http://localhost:' + port);


var apiRoutes = express.Router(); 

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});


app.post('/register', function(req, res) {
    console.log('/register');
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    
    if (!username) {
      res.json({
        success: false, 
        message: 'No username provided'
      });
    }
    if (!password) {
      res.json({
        success: false,
        message: 'No password provided'
      });
    }
    if (!email) {
      res.json({
        success: false,
        message: 'No email provided'
      });
    }
    
    auth.register(username, email, password, function (err) {
        if (err) {
            res.json({success: false, message: err});
        } else {
            res.json({success: true});
        }
    });
});


app.post('/authenticate', function(req, res) {

    let username = req.params.username
    if (!username) {
        username = req.body.username;
    }

    let password = req.params.password
    if (!password) {
        password = req.body.password;
    }
    
    if (!username) {
        res.json({
            success: false, 
            message: 'No username provided'
        });
    }
    if (!password) {
        res.json({
            success: false,
            message: 'No password provided'
        });
    }
    console.log('username: ' + username)
    auth.login(username, password, function(err, token) {
        if (err) {
            res.json({success: false, message: err});
        } else {
            res.json({success: true, token: token});
        }
    });

});   


apiRoutes.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        auth.verify(token, function(err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Failed to authenticate'
                });
            } else {
                req.decoded = decoded;    
                next();
            }
        });
    } else {
        return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
        });
    }
});


apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    }); 
});


apiRoutes.post('/request', function(req, res) {
    var username = req.decoded['_doc']['name']
    var email = req.decoded['_doc']['email']
    console.log('username: ' + username);
    console.log('email: ' + email);
    
    var latitude = req.body.latitude;
    if (!latitude) {
        res.json({
            success: false,
            message: 'no latitude provided'
        });
        return;
    }
    var longitude = req.body.longitude;
    if (!longitude) {
        res.json({
            success: false,
            message: 'no longitude provided'
        });
        return;
    }


    request.create(username, latitude, longitude, text, function (err) {
        if (err) {
            res.json({
                success: false,
                message: err
            });
        } else {
            res.json({
              success: true
            });
        }
    });
});




app.use('/api', apiRoutes);












