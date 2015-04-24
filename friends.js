var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Declare the schema of our form:

var friendForm = forms.create({
  name: forms.fields.string({required: true}),

});


function populateFriendList(req, res, locals, cb) {
    var friendModel =  require('./mongoUtil.js').friendModel;
    var friend_data = [];
    friendModel.find({owner: require('./index.js').currUser.username},
        function(err, friend) {
            if (err) return handleError(err);
        for (i = 0; i < friend.length; i++) {
            var item = friend[i];
            friend_data.push(form.data.name);
        }
        cb(friend_data);
    });
}


// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals


function renderForm(req,res,locals){
        populateFriendList(req, res, locals, function(friend_data) {
            res.render('friends', extend({
                title: 'Add Friends',
                csrfToken: req.csrfToken(),
                name: req.user.name,
                f: friend_data
            },locals||{}));
        });

}

// function authenticateFriend(form) {
//     app.getAccounts({email: form.data.name}, function(err, accounts) {
//       if (err) {
//           if(err.developerMessage){
//             console.error(err);
//       }
//       else {
//           accounts.each(function (account, index) {
//             console.log(account.givenName + " " + account.surname);
//           });
//       }
//   });
// }

// Export a function which will create the
// router and return it

module.exports = function addFriends(){
    var friend =  new (require('./mongoUtil.js').friendModel)();
    var router = express.Router();

  // router.use(csurf());
  router.use(csurf({ sessionKey: 'stormpathSession' }));

  // Capture all requests, the form library will negotiate
  // between GET and POST requests

  router.all('/', function(req, res) {
    friendForm.handle(req,{
      success: function(form){
        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care
        // about and then cal save() on the user object:
        // req.user.name = form.data.name;
        // req.user.surname = form.data.surname;
        // req.user.customData.streetAddress = form.data.streetAddress;
        // req.user.customData.city = form.data.city;
        // req.user.customData.state = form.data.state;

        // Populates model and saves to database

        friend.owner = res.locals.user.username;
        friend.friendName = form.data.name;
        friend.save();


        authenticateFriend(form);
        req.user.customData.friend = req.user.customData.friend + " " + form.data.name;

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
          errors:[{error:'Your form has expired. Please try again.'}]
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
