import express from "express";
import axios from "axios";
import authorize from "../middleware/authorization.js";

const router = express.Router()

router.post("/emotionprediction", authorize, async(req, res) => {
    try{
            const response = await axios.post("http://localhost:8000/predict", {
            text: req.body.text
        });
        res.json(response.data);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
    
});

export default router ;