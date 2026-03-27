import express from "express"
import dotenv from "dotenv"
import cors from "cors"
//routes
import authRoutes from "./routes/auth.routes.js"
import calculatorRoutes from "./routes/calculator.routes.js"
import strategyRoutes from "./routes/strategy.routes.js"
import supportResistanceRoutes from "./routes/supportResistance.routes.js"

dotenv.config()

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// await connectDB()

const port = process.env.PORT || 8000;

//routes
app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/calculator",calculatorRoutes)
app.use("/api/v1/strategy",strategyRoutes)
app.use("/api/v1/sr",supportResistanceRoutes)


app.listen(port, () =>{
    console.log(`Server is running on Port: ${port}`);
})