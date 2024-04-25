import jwt from "jsonwebtoken"

const protect = async(req, res, next) =>{


    if(req.headers.authorization && req.headers.authorization.split(" ")[0] == "Bearer"){
        let token = req.headers.authorization.split(" ")[1]
        await jwt.verify(token, process.env.TOKEN, (err, decoded) =>{

            if(err){    
                req.login = "authenticated error"
            }else{  
                req.login = decoded
            }

        })
       
    }else{
        req.login = "invalid credentials"
    }
    next()
}


export default protect