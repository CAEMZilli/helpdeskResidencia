import cors from "cors"
import express from "express"
import helmet from "helmet"
import userRoutes from "./src/routes/userRoutes"
import ticketRoutes from "./src/routes/ticketRoutes"
import departmentRoutes from "./src/routes/departmentRoutes";
import machineRoutes from "./src/routes/machineRoutes";
import catServicesRoutes from "./src/routes/catServicesRoutes";
import authRoutes from "./src/routes/authRoutes";
import { authMiddleware } from "./src/middleware/authMiddleware";

const app = express();

app.use(express.json());

// CORS: en producción, define CORS_ORIGIN con el/los dominios del frontend
// (separados por coma). Sin la variable (desarrollo local) se permite cualquier
// origen. Como la autenticación usa el header Authorization (no cookies),
// no se requiere credentials.
const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean);
app.use(cors(corsOrigins && corsOrigins.length > 0 ? { origin: corsOrigins } : {}));

app.use(helmet());  //helmet esconde informacion sobre el servidor

// Ruta pública de autenticación (login)
app.use("/api/auth", authRoutes);

// A partir de aquí, todas las rutas exigen un token JWT válido.
app.use(authMiddleware);

app.use("/api/user", userRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/machine", machineRoutes);
app.use("/api/catservices", catServicesRoutes);


const PORT = process.env.PORT || 3000;



app.listen(PORT,()=>{
    console.log("Corriendo")
})


