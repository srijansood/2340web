var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Declare the schema of our form:
var wlForm = forms.create({
  itemName: forms.fields.string({required: true}),
  price: forms.fields.number({required: true}),

});

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals

function renderForm(req,res,locals){
  res.render('wishlist', extend({
    title: 'Wishlist',
    csrfToken: req.csrfToken()
  } , locals || {} ));
}

// Export a function which will create the
// router and return it
module.exports = function wishlist(uservar){
  var wish =  new (require('./mongoUtil.js').wishModel)();
  var router = express.Router();
  router.use(csurf({ sessionKey: 'stormpathSession' }));

  // Capture all requests, the form library will negotiate
  // between GET and POST requests
  router.all('/', function(req, res) {
    wlForm.handle(req,{
      success: function(form){

        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // Populates model and saves to database
        wish.itemName = form.data.itemName;
        wish.price = form.data.price;
        wish.save();

        // var jsdom = require('jsdom').jsdom;
        // var doc = jsdom();
        // var window = doc.defaultView;
        // doc.getElementById("map_img").src = map_img;

        renderForm(req,res,{
              saved:true
            });
        // res.send('Table: ' + sales);
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
