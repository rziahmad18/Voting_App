// const { error } = require("console");
const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {

    //first check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({errors: "Token not found"});

    //extract the jwt token from the request header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: "unauthorized"});

    try{
        //verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Attach user infromation to the request object
        req.user = decoded
        next();
    }catch(err){
        console.log(err)
        res.status(401).json({error: "invalid token"});

    }

}

//function to generate JWT token
const generateToken = (userData) => {
    //Generate a new JWT token user data
    return jwt.sign(userData, process.env.JWT_SECRET,{expiresIn: 3000});
    
}
module.exports = {jwtAuthMiddleware, generateToken};