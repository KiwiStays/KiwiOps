import express from 'express';
import cors from 'cors';
import  { v2 as cloudinary } from 'cloudinary';
import PropertyRouter from "../routes/Property.route.js";


const app = express();
app.use(express.json({limit: '10mb'}));
app.use(cors({
  origin: ["https://kiwiops.in", "https://api.kiwiops.in"],
  credentials: true
}));





cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});


// app.use("/api/guest", Guestrouter);
app.use("/api/property", PropertyRouter);
// app.use("/api/auth/", AuthRouter);



app.get('/', async (req, res) => {
    res.send('Hello KiwiStays!');
})


export default app;
