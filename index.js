const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const database = require("./config/database");
const userRoutes = require("./routes/User")


//database connection
database.connect()
const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(cookieParser())


//Routes
app.use("/api/v1/auth" , userRoutes)


//Default Route
app.get("/" , (req,res)=> {
    return res.json({
        success : true,
        message : "Your Server Is Up And Running..."
    })
})

//Activate Your Server
app.listen(PORT, () => {
    console.log(`App is Running at ${PORT}`)
});

