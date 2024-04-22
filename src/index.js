require("dotenv").config();
const app = require("./app");
const connectDb = require("./db");

let PORT = process.env.PORT || 3000;

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App is listening on port: ${PORT}!!`)
        });
    })
    .catch((error) => {
        console.log("MONGO DB Connection Failed!!", error)
    })