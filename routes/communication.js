const express = require("express"),
    router = express.Router(),
    multer = require('multer'),
    path = require('path'),
    fs = require('fs'),
    passport = require('passport'),
    User = require('../models/user'),
    Communication = require('../models/commu'),
    middleware = require('../middleware');

    const storage = multer.diskStorage({
        destination : './public/uploads/commu',
        filename : function(req, file, cb){
            cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    });
    
    const imageFilter = function(req, file, cb){
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif'){
            return cb(new Error('Only image is allow to upload'),false)
        }
        cb(null, true);
    }
    
    const upload = multer({storage : storage, fileFilter : imageFilter});

router.get("/", function(req,res){
    Communication.find({}, function(error,allCommu){
        if(error){
            console.log("Error to find commu database");
            
        }else{
            res.render("column", {Commu : allCommu});
        }
    })
});

router.get("/create", function(req,res){
    res.render("c_column");
});

router.get("/type", function(req,res){
    res.render("column_game_type");
});


router.post("/create", middleware.isLoggedIn, upload.single('image'), function(req,res){
    let n_head = req.body.head;
    let n_content = req.body.content;
    let n_user_post = {id: req.user._id, alias: req.user.alias};
    let n_image = req.file.filename;
    let n_game = req.body.game;
    var asiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Bangkok"});
    let n_date = new Date(asiaTime).toISOString();
    let n_post = {head:n_head, content:n_content, user_post:n_user_post, game:n_game, date: n_date, image : n_image};
    Communication.create(n_post, function(error, newCommu){
        if(error){
            console.log("error create commu");
        }
        else{
            console.log(newCommu);
            res.redirect("/commu");
        }
    })
})

router.get("/:id", function(req,res){
    Communication.findById(req.params.id).populate('comments').exec( function(error, idCommu){
        if(error){
            console.log("ERROR");
            
        } else{
            res.render("column_detail",{commu:idCommu});
            }
        }
    )}
)

router.put("/:id", middleware.checkCommuOwner, upload.single('image'), function(req, res){
    let n_head = req.body.head;
    let n_content = req.body.content;
    if(req.file){
        let n_image = req.file.filename;
        console.log(n_image);
        News.findById(req.params.id, function(err, foundCommu){
            if(err){
                console.log(err);
                res.redirect('/commu/'+ req.params.id)
            } else{
                const imagePath = './public/uploads/commu/' + foundCommu.image;
                fs.unlink(imagePath, function(err){
                    if(err){
                        console.log(err);
                        res.redirect('/commu');
                    }
                })
            }
        })
        var n_commu = {head : n_head, image : n_image, content : n_content}
    } else {
        var n_commu = {head : n_head, content : n_content}
    }
    News.findByIdAndUpdate(req.params.id, n_commu, function(err, updateCommu){
        if(err){
            console.log(err);
            
        } else {
            res.redirect('/commu/' + req.params.id);
        }
    })
})

router.delete("/:id", middleware.checkCommuOwner, function(req,res){
    Communication.findById(req.params.id, function(err, foundCommu){
        if(err){
            console.log(err);
            res.redirect('/commu/'+ req.params.id)
        } else{
            const imagePath = './public/uploads/commu/' + foundCommu.image;
            fs.unlink(imagePath, function(err){
                if(err){
                    console.log(err);
                    res.redirect('/commu');
                }
            })
        }
    })
    Communication.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log("error to delete commu");
            res.redirect("/commu");
        }
        res.redirect("/commu");
    });
})


module.exports = router;
