import express from "express"
import helmet from "helmet"
import userRoutes from "./src/routes/userRoutes"
import ticketRoutes from "./src/routes/ticketRoutes"
import departmentRoutes from "./src/routes/departmentRoutes";
import machineRoutes from "./src/routes/machineRoutes";

const app = express();

app.use(express.json());

app.use(helmet());  //helmet esconde informacion sobre el servidor

app.use("/api/user",userRoutes);
app.use("/api/ticket",ticketRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/machine", machineRoutes);


const PORT = process.env.PORT || 3000;



app.listen(PORT,()=>{
    console.log("Corriendo")
})


