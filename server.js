import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import calculatorRoutes from "./routes/calculator.routes.js"

dotenv.config()

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connectDB()

const port = process.env.PORT || 8000;


app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/calculator",calculatorRoutes)


app.listen(port, () =>{
    console.log(`Server running on ${port}`);
})