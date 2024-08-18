 const express = require("express")
 const router = express.Router();
 const User = require('./../models/user');
 const{jwtAuthMiddleware, generateToken} = require('./../jwt');
//  const { error } = require("console");
  
// /POST route to add a user
 router.post('/signup', async(req, res)=> {
    try{
        const data = req.body //Assuming the request body contains the user data 

        //create a new user document using the mongoose model
        const newUser = new User(data);
        
        //save the new User to the Databse
        const response = await newUser.save();
        console.log("data saved");

        const payload = {
            id: response.id,
            username: response.username
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "internall server error"});
    }
 })

 //Login Route
 router.post('/login', async(req, res)=> {
    try{
        //extract the adhaar card number and password from req body
        const {adhaarCardNumber,password} = req.body 

        // find the user by adhaarCard number
        const user = await User.findOne({adhaarCardNumber: adhaarCardNumber});
        
        //if user does not exist or password does not match , return error
        if (!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"invalid username or password"})
        }

        //Generate Token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);
        //return token as a response
        res.json((token))
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "internal server error"});
    }
 })

 //Profile route
 router.post('/profile', async(req, res)=>{
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Internal Server error"})
    }

 })

 //change password
 router.put('/profile/password',jwtAuthMiddleware, async(req, res) => {
    try{
        const userId = req.user // Extract the id from the token
        const{currentPassword, newPassword} = req.body //Extract curent and new password from body

        //Find the user by userId
        const user = await User.findById(userId);

        //if password does not match , return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: "invalid password"});
        }
        //update the user password
        user.password = newPassword;
        await user.save();

        console.log("password updated");
        res.status(200).json({message: "password updated"});

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server error"})
    }
 } )

 module.exports = router;