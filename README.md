# 2340web
Web Application - Shopping with Friends for CS2340

###Abstract:
The web app is made in Node.js, and uses the Jade templating engine which allows for better **model view separation**.
It uses MongoDB as a *database* and is *persistent*. The database implementation utilizes the **Singleton** design pattern. Only one instance exists, and whenever require('mongoose') or require('./mongoUtil.js') is called, the same singleton is returned.

###Feature Log:
1. Login:
    * Standard
    * Facebook Integration
    * Admin Functionality - Test with https://swf45.herokuapp.com/admins
    * Email based password recovery
    * current user is exported - ____ Design Pattern
2. Profile:
    * Forms library separates rendering and validation by passing the template to jade; model-view separation
    * Displays Sales Report created by user
    * **Display Avg Rating TODO** - initialization left
3. Sales Report:
    * Stored in salesmodel Model
    * Required Fields usage in form
    * Display confirmation of submission
    * **Display Map location once submitted TODO** - have image, display
4.  **Friends: TODO**
    * Add Friend by username
    * Display all friends in a list
    * Clicking on one takes to friend's profile (can just use modified profile.js)
        * Give Rating
        * Delete Friend**
5. **Wishlist: TODO**
    * Add new item
    * View existing items in wishlist below add
    * Groupon coupon offer on adding item to wishlist
    * Scan items in wishlist across friends' sales reports on log in. Notification on match
