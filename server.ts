import express from "express"
import helmet from "helmet"
import userRoutes from "./src/routes/userRoutes"
import ticketRoutes from "./src/routes/ticketRoutes"

const app = express();

app.use(express.json());

app.use(helmet());  //helmet esconde informacion sobre el servidor

app.use("/api/user",userRoutes)
app.use("/api/ticket",ticketRoutes)
const PORT = process.env.PORT || 3000;



app.listen(PORT,()=>{
    console.log("Corriendo")
})

