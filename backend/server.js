import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "../database/db.js";
import foodRouter from "./routes/food.route.js";
import userRouter from "./routes/user.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import metricsMiddleware from "./middleware/metrics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });
// app config
const app = express();

//middleware
app.use(express.json());
app.use(cors());

// Prometheus metrics - MUST be before other routes
app.use(metricsMiddleware);

connectDb();

//api endpoints
//food api
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));

//user api
app.use("/api/user", userRouter);

//cart api
app.use("/api/cart", cartRouter);

//order api
app.use("/api/order", orderRouter)

//restaurant api
app.use("/api/restaurant", restaurantRouter)

app.get("/", (req,res)=>{
  res.send("Hello")
  console.log("hello")
})

app.listen(process.env.PORT, () => {
  console.log("Server is running in: " + process.env.DOMAIN);
  console.log("📊 Metrics available at: " + process.env.DOMAIN + "/metrics");
});

