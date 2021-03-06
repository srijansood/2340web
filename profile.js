var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Declare the schema of our form:
var profileForm = forms.create({
  givenName: forms.fields.string({
    required: true
  }),
  surname: forms.fields.string({ required: true })
});

//Populates a list of sales reports created by the current user
function populateSR(req, res, locals, cb) {
    var salesModel =  require('./mongoUtil.js').salesModel;
    var sr_data = [];
    salesModel.find({owner:  require('./index.js').currUser.username},
        function(err, sale) {
            if (err) return handleError(err);
        for (i = 0; i < sale.length; i++) {
            var item = sale[i];
            sr_data.push(item.itemName);
        }
        cb(sr_data);
    });
}

function populateWL(req, res, locals, cb) {
    var wishModel =  require('./mongoUtil.js').wishModel;
    var wl_data = [];
    wishModel.find({owner:  require('./index.js').currUser.username},
        function(err, wish) {
            if (err) return handleError(err);
        for (i = 0; i < wish.length; i++) {
            var item = wish[i];
            wl_data.push(item.itemName);
        }
        cb(wl_data);
    });
}

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals
function renderForm(req,res,locals){
    populateSR(req, res, locals, function(sr_data) {
        populateWL(req, res, locals, function(wl_data) {
            res.render('profile', extend({
                title: 'My Profile',
                csrfToken: req.csrfToken(),
                givenName: req.user.givenName,
                surname: req.user.surname,
                email: req.user.username,
                rating: req.user.customData.rating,
                wl: wl_data,
                sr:sr_data
            },locals||{}));
           });
       })
}

// Export a function which will create the
// router and return it
module.exports = function profile(){

  var router = express.Router();
  router.use(csurf({ sessionKey: 'stormpathSession' }));

  // Capture all requests, the form library will negotiate
  // between GET and POST requests
  router.all('/', function(req, res) {
    profileForm.handle(req,{
      success: function(form){
        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care
        // about and then cal save() on the user object:
        req.user.givenName = form.data.givenName;
        req.user.surname = form.data.surname;
        req.user.customData.rating = form.data.rating;
        req.user.save(function(err){
          if(err){
            if(err.developerMessage){
              console.error(err);
            }
            renderForm(req,res,{
              errors: [{
                error: err.userMessage ||
                err.message || String(err)
              }]
            });
          }else{
            renderForm(req,res,{
              saved:true
            });
          }
        });

        var util = require('util'),
        OperationHelper = require('../lib/apac').OperationHelper;
        var opHelper = new OperationHelper({
            awsId: 'AKIAJCJM7JNT2SRDPXEA',
            awsSecret: 'Ntz2oC3Sbs1n2L/o2KVRDI2OljhUNnVJ1piOTaR6',
            //assocId: '[YOUR ASSOCIATE TAG HERE]'
        });
        opHelper.execute('ItemSearch', {
            'SearchIndex': 'Books',
            'Keywords': 'Harry Potter',
            'ResponseGroup': 'ItemAttributes,Offers'
        }, function(err, results) {
               console.log(results);
               renderForm(req, res, results, locals, {
                     saved:true
               });
           });
      },
      error: function(form){
        // The form library calls this method if the form
        // has validation errors.  We will collect the errors
        // and render the form again, showing the errors
        // to the user
        renderForm(req,res,{
          errors: collectFormErrors(form)
        });
      },
      empty: function(){
        // The form library calls this method if the
        // method is GET - thus we just need to render
        // the form
        renderForm(req,res);
      }
    });
  });

  // This is an error handler for this router
  router.use(function (err, req, res, next) {
    // This handler catches errors for this router
    if (err.code === 'EBADCSRFTOKEN'){
      // The csurf library is telling us that it can't
      // find a valid token on the form
      if(req.user){
        // session token is invalid or expired.
        // render the form anyways, but tell them what happened
        renderForm(req,res,{
          errors:[{error:'Your form has expired.  Please try again.'}]
        });
      }else{
        // the user's cookies have been deleted, we dont know
        // their intention is - send them back to the home page
        res.redirect('/');
      }
    }else{
      // Let the parent app handle the error
      return next(err);
    }
  });

  return router;
};
