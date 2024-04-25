import User from "../Models/User.js"

const showUserByProximity = async(req, res) =>{

    if(req.login == "invalid credentials"){
        res.status(400).json({msg: "invalid credentials"})

    }else if(req.login == "authenticated error"){
        res.status(400).json({msg: "invalid credentials"})

    }else{
        const {id, email } = req.login

        User.findById(id)
        .exec()
        .then(async(data) =>{


            let friendsId = []
            let sendReqId = []

            data?.friends?.map((each) => friendsId.push(each))
            data?.likes?.map((each) => sendReqId.push(each))


           let dd = await User.find({
            $and:[
                {
                    _id:{$nin: [...friendsId, ...sendReqId,  id]}
                },

                {
                    gender: data?.interest
                }
            ]
           }
            )
            
            res.status(200).json(dd)
        })
        .catch((err) =>{
            res.status(400).json({msg:err.message})
        })
    }

}

const likeProfile = async(req, res) =>{

    if(req.login == "invalid credentials"){
        res.status(400).json({msg: "invalid credentials"})

    }else if(req.login == "authenticated error"){
        res.status(400).json({msg: "invalid credentials"})

    }else{

        const  {user_id, login_id} = req.query

        await User.findById(login_id)
        .exec()
        .then(async(data) =>{

            let swipeUser = await User.findById(user_id)

            let chk = await data?.req.find((each) => each == user_id)

            if(chk == undefined){

                swipeUser.req.push(login_id)
                data.likes.push(user_id)

                data.save()
                swipeUser.save()

                res.status(200).json("success")
            }

            else{

    
                
                swipeUser.req.push(login_id)
                data.likes.push(user_id)

                data.friends.push(user_id)
                swipeUser.friends.push(login_id)
                
                data.save()
                swipeUser.save()
            
                res.status(200).json({a: data?.photos[0]?.url, b: swipeUser?.photos[0]?.url, user_id: swipeUser?._id})
                
            }
            
            
            
        }).catch((err) =>{
            console.log(err);
        })

    }

}



export { 
    showUserByProximity,
    likeProfile
}