var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt")


var userSchema = new Schema({
    name: {
        type:String,
    },
    email: {
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: { 
        type: String, 
        required: true,
        minlength: 4,
    }
}, {timestamps:true});

userSchema.pre("save", function(next) {
    if(this.password &&  this.isModified("password")) {
        // bcrypt.hash(this.password, 10, (err, hashed)=> {
        //     if(err) return next(err);
        //     this.password = hashed;
        //     return next();
        // })
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
})

userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

var User = mongoose.model("User", userSchema);

module.exports = User;