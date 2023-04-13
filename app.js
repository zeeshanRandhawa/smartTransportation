const express = require("express");
const app = express();
const cors = require("cors");

// const corsOptions = {
//     origin: 'http://localhost:3000', // allow requests from this origin
//     optionsSuccessStatus: 200 // return 200 for preflight requests
//   };

//   app.use(cors(corsOptions)); // enable CORS with specific options

app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
//Static files:
app.use(express.static("public"));

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


module.exports = app;
