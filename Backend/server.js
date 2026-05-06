import express from "express"
import { authRouter } from "./routes/authRoutes.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import requestIP from "request-ip";
import { verifyAuthentication } from "./middlewares/verifyAuthMiddleware.js";
import server_URL from "./environment.js"
import { predictionRoutes } from "./routes/predictionRoutes.js";

const app = express();

const Port = process.env.PORT || 8080;

app.set("port", Port);


app.use(cors(
    {
        origin: server_URL,
        methods: ["GET", "POST", "DELETE", "PATCH"],
        credentials: true,
    }
))


app.use(cookieParser())

app.use(bodyParser.json());
app.use(express.json({ limit: "50kb"}));

app.use(express.urlencoded({ limit: "50kb", extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(requestIP.mw())

// app.use(verifyAuthentication);


app.get("/", (req, res) => {
    if(!req.user) return res.status(200).json({messgae: "Please Signup or Login"})
    try{
        res.status(200).json({message: "Welcome to home page-- Please Signup"})
    }catch(error){
        res.status(400).json({errors: error})
    }
})



app.use(authRouter);

app.use('/api/prediction', predictionRoutes);


app.listen(app.get("port"), () => {
    console.log("Server start----");
})
