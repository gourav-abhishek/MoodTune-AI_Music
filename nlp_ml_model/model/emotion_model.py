import torch
from transformers import AutoTokenizer, AutoModel
from torch import nn
import re, emoji, contractions,os

# Load tokenizer and model

TOKENIZER_PATH = os.path.join(os.path.dirname(__file__), "tokenizer")  # relative path
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH, local_files_only=True)

MODEL_NAME = "distilbert-base-uncased"
transformer = AutoModel.from_pretrained(MODEL_NAME)




class MultiLabelEmotionClassifier(nn.Module):
    def __init__(self, transformer, num_labels):
        super().__init__()
        self.transformer = transformer
        self.dropout = nn.Dropout(0.3)
        self.classifier = nn.Linear(transformer.config.hidden_size, num_labels)

    def forward(self, input_ids, attention_mask):
        outputs = self.transformer(input_ids=input_ids, attention_mask=attention_mask)
        cls_token = outputs.last_hidden_state[:, 0, :]
        cls_token = self.dropout(cls_token)
        logits = self.classifier(cls_token)
        return logits


# Load trained weights
MODEL_PATH = os.path.join(os.path.dirname(__file__), "emotion_classification_model.pth")
model = MultiLabelEmotionClassifier(transformer, num_labels=6)
model.load_state_dict(torch.load(MODEL_PATH, map_location='cpu'))
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()



# Preprocessing functions
def clean_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'https?://\S+|www\.\S+', '<URL>', text)
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,}', '<USEREMAIL>', text)
    text = re.sub(r'@\w+', '<USERNAME>', text)
    text = re.sub(r'\d{5,}', '<NUMBER>', text)
    text = re.sub(r'#(\w+)', r'\1', text)
    text = emoji.demojize(text)
    text = re.sub(r'[^\w\s!?,\.]', '', text)
    text = contractions.fix(text)
    text = text.lower()
    return text

def replace_slang(text):
    slang_dict = {"u":"you","r":"are","ur":"your","idk":"I don't know",
                  "lol":"laughing out loud","btw":"by the way","omg":"oh my god",
                  "ttyl":"talk to you later","brb":"be right back","smh":"shaking my head",
                  "lmao":"laughing my ass off","fyi":"for your information",
                  "asap":"as soon as possible","b2b":"business to business",
                  "tbh":"to be honest","imho":"in my humble opinion",
                  "eta":"estimated time of arrival","q1":"quarter one",
                  "q2":"quarter two","q3":"quarter three","q4":"quarter four"}
    pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in slang_dict.keys()) + r')\b', re.IGNORECASE)
    return pattern.sub(lambda m: slang_dict[m.group(0).lower()], text)

def predict_emotion(input_text):

    text = clean_text(input_text)
    text = replace_slang(text)
    encodings = tokenizer([text], truncation=True, padding=True, max_length=128, return_tensors="pt")
    with torch.no_grad():
        input_ids = encodings["input_ids"].to(device)
        attention_mask = encodings["attention_mask"].to(device)
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        preds = torch.sigmoid(outputs)

    THRESHOLD = 0.5
    pred_labels = (preds >= THRESHOLD).int()
    emotions = ['Fun', 'Sadness', 'Angry', 'Love', 'General', 'Motivation']
    if torch.all(pred_labels[0] == 0):
        return [emotions[torch.argmax(preds[0]).item()]]
    return [emotions[i] for i, label in enumerate(pred_labels[0]) if label == 1]
