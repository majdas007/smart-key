const express = require('express');
const router = express.Router();
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const config = require('../Conf/DbConf')
const responseHandler = require('../Conf/resHandler');
const mailService = require('../Conf/emailService')
const md5 = require('md5');

router.post('/signup', (req, res, next) => {

    console.log('register');
    // if (validation.isEmpty(req.body.firstName)) {
    //     return responseHandler.resHandler(false, {}, 'Email required', res, 400);
    // }
    // else if (validation.isEmpty(req.body.lastName)) {
    //     return responseHandler.resHandler(false, {}, 'Email required', res, 400);
    // }
    // else if (validation.isEmpty(req.body.email)) {
    //     return responseHandler.resHandler(false, {}, 'Email required', res, 400);
    // }
    // else if (validation.validateEmail(req.body.email) === false) {
    //     return responseHandler.resHandler(false, {}, 'Invalid email address', res, 400);
    // }
    // else if (validation.isEmpty(req.body.password)) {
    //     return responseHandler.resHandler(false, null, 'password required', res, 400);
    // }
    // else if (validation.isEmpty(req.body.phone)) {
    //     return responseHandler.resHandler(false, null, 'password required', res, 400);
    // }
    // else if (validation.isEmpty(req.body.updates)) {
    //     return responseHandler.resHandler(false, null, 'password required', res, 400);
    // }

   // const otp = Math.floor(1000 + Math.random() * 9000);
    const emailHash = md5(req.body.Email);
    const dataObject = {
        password: req.body.password,
        FirstName: req.body.FirstName,
        LastName  : req.body.LastName,
        Address :req.body.Address,
        Email : req.body.Email,
        Zip :req.body.Zip,
        City : req.body.City,
        emailHash : emailHash
    };
    //dataObject.password = new User.generateHash(req.body.password);
    const newUser = new User();
    dataObject.password = newUser.generateHash(req.body.password);

    console.log('dataObject',dataObject);

    User.findOne({ Email: dataObject.Email })
        .then(user => {
            console.log('user',user);
            if (!user) {
                User.create(dataObject)
                    .then(result =>{
                        let link = 'http://localhost:3002/users/verify/'+emailHash
                         const emailResp = mailService.emailVerification(dataObject.Email, dataObject.firstName, link);
                        responseHandler.resHandler(true, result._id, null, res, 200);
                    })
                    .catch(error => responseHandler.resHandler(false, null, `error : ${error}`, res, 500));

            }else{
                return responseHandler.resHandler(false, null, 'Email address already in use.', res, 200);
            }
        })
        .catch(error =>{
            return responseHandler.resHandler(false, null, 'error :'+error, res, 500);

        });


});

router.post('/login', (req, res) => {
    User.findOne({Email: req.body.Email})
        .then(user => {
            if (!user) {
                return responseHandler.resHandler(false, null, 'The email address or password you entered is incorrect.', res, 400);
            } else if (user) {
                if (!user.validPassword(req.body.password)) {
                    return responseHandler.resHandler(false, null, 'The email address or password you entered is incorrect.', res, 400);
                } else if (!user.isEmailVerified) {
                    return responseHandler.resHandler(false, null, 'You must confirm your email address to continue.', res, 400);

                } else {
                    let userObj = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        id: user._id
                    };

                    const token = jwt.sign(userObj, config.secretKey, {
                        expiresIn: 6400, // expires in 24 hours
                    });
                    const data = {token, user: userObj};
                    return responseHandler.resHandler(true, data, 'Your email has been successfully confirmed.', res, 200);

                }
            }
        })
        .catch(error => {
            return responseHandler.resHandler(false, {}, 'Something Went Wrong ' + error, res, 500);
        });

});


router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Logout successful!'
  });
});
router.get('/list' , function (req,res) {
  User.find().then( users => {
    res.send(users)
  }).catch(err => res.send(err))
  // var token = req.body.token || req.query.token || req.headers['x-access-token'] ||  req.headers['authorization'];
  //var decoded = jwtDecode(token);
  //res.send(decoded._id)

})


router.get('/verify/:id', function (req,res) {
    let hash = req.params.id;
    console.log(hash)
    User.findOne({emailHash:hash })
        .then(user => {
            console.log('user',user);
            if (user) {
                if(!user.isEmailVerified){
                    User.findOneAndUpdate({emailHash:hash },
                        {
                            $set: {
                                'isEmailVerified': true
                            }
                        },
                        { new: true })
                        .then(userData => {
                            return responseHandler.resHandler(true, {}, 'Your email has been successfully confirmed.', res, 200);
                            //res.render('login',{msg:'Your email has been successfully confirmed.'});

                        }).catch(err => {
                        return responseHandler.resHandler(false, {}, 'Something Went Wrong', res, 500);
                       // res.render('login',{msg:'An unknown error has occurred. Please try again or contact the support team at support@driveoo.com.'});

                    });

                }
                else {
                    return responseHandler.resHandler(false, {}, 'Email already verified', res, 200);
                 //   res.render('login',{msg:'Email already verified'});

                }

            }
        })
        .catch(error=>{
            res.render('login',{msg:'An unknown error has occurred. Please try again or contact the support team at support@driveoo.com.'});
            //return responseHandler.resHandler(false, {}, 'Something Went Wrong '+error, res, 500);

        });



    
})
module.exports = router;
