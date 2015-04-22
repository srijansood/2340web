var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Declare the schema of our form:
var srForm = forms.create({
  itemName: forms.fields.string({required: true}),
  price: forms.fields.number({required: true}),
  location: forms.fields.string({required: true}),
  description: forms.fields.string({widget: forms.widgets.textarea}),
});

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals

function renderForm(req,res,locals){
  res.render('newsr', extend({
    title: 'New Sales Report',
    csrfToken: req.csrfToken()
  } , locals || {} ));
}

// Export a function which will create the
// router and return it

module.exports = function newsr(){
  var sales =  new (require('./mongoUtil.js').salesModel)();
  var router = express.Router();
  router.use(csurf({ sessionKey: 'stormpathSession' }));

  // Capture all requests, the form library will negotiate
  // between GET and POST requests
  router.all('/', function(req, res) {
    srForm.handle(req,{
      success: function(form){

        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care
        // about and then cal save() on the user object:
        sales.owner = require('./index.js').currUser.username;
        sales.itemName = form.data.itemName;
        sales.price = form.data.price;
        sales.location = form.data.location;
        sales.description = form.data.description;
        sales.save();
        res.send('Table: ' + sales);
        // req.user.save(function(err){
        //   if(err){
        //     if(err.developerMessage){
        //       console.error(err);
        //     }
        //     renderForm(req,res,{
        //       errors: [{
        //         error: err.userMessage ||
        //         err.message || String(err)
        //       }]
        //     });
        //   }else{
        //     renderForm(req,res,{
        //       saved:true
        //     });
        //   }
        // });
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
