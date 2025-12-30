from fastapi import FastAPI
from pydantic import BaseModel
from model.emotion_model import predict_emotion

app = FastAPI(title="MoodTune AI")

# Request Schema
class TextRequest(BaseModel):
    text: str 

# Test endpoint
@app.get("/")
def root():
    return {"message": "MoodTune AI App running"}

@app.post("/predict")
def make_prediction(request: TextRequest):
    emotions = predict_emotion(request.text)
    return {"emotions" : emotions}