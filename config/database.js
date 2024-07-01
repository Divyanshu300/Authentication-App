const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then( () => console.log("DB Connect Successfully"))
    .catch((error) => {
        console.log("Database Connection Failure")
        console.error(error)
        process.exit(1)
    })
}