import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuth = async(req, res, next) =>{
    try {
        const { token } = req.headers

        if(!token){
            return res.status(403).josn({
                message: "Please Login",
            });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decodedData._id);

        next();

    } catch (error) {
        return res.status(400).json({
            message: "Please Login"
        })
    }
}