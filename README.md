# 2340web
Web Application - Shopping with Friends for CS2340

###Abstract:
The web app (*EC 40-100*) is made in Node.js, and uses the Jade templating engine which allows for better **model view separation** (*EC 7-10*).  
UI + Animation utilizies bootstrap (*EC 3-10 + 5-10*)
It uses MongoDB as a *database* (*EC 10-15*) and is *persistent* (REST: *EC 10-30*). The database implementation utilizes the **Singleton** design pattern (*EC 1*). Only one instance exists, and whenever require('mongoose') or require('./mongoUtil.js') is called, the same singleton is returned.

###Feature Log:
1. Login:
    * Standard
    * Facebook Integration (*EC 5-10*)
    * Admin Functionality - Test with https://swf45.herokuapp.com/admins (*EC*)
    * Email based password recovery (*EC 5-10*)
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
    * View existing items in wishlist
    * Groupon coupon offer on adding item to wishlist (*EC 5-10*)
    * Scan items in wishlist across friends' sales reports on log in. Notification on match, push notification (*EC 5*)
