import express from "express"
import dotenv from "dotenv"
import cors from "cors"

// import authRoutes from "./routes/auth.routes.js"

dotenv.config()

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connectDB()

const port = process.env.PORT || 8000;


// app.use("/api/v1/users",authRoutes)


app.listen(port, () =>{
    console.log(`Server running on ${port}`);
})