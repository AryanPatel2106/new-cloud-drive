import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from 'path';
import { fileURLToPath } from 'url';
const app = express()


// basic configurations
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


// cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173', // for vite application
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
    })
)


// import routers 
import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import fileRouter from "./routes/file.routes.js"

app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)
app.use('/api/v1/files', fileRouter)



/*
// ----------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../auth-frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth-frontend/dist/index.html'));
});
*/



export default app