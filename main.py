from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
import os

# Disable tokenizer warning
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from transformers import BlipProcessor, BlipForConditionalGeneration
# from googletrans import Translator

# -----------------------------
# INIT APP
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "cpu"

# -----------------------------
# LOAD LIGHT MODELS
# -----------------------------
print("Loading BLIP model...")

processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base",
    local_files_only=False
)

model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base",
    local_files_only=False
).to(device)

print("Model loaded!")

# Lightweight translator
# translator = Translator()

# -----------------------------
# CAPTION FUNCTION (FAST)
# -----------------------------
def generate_caption(image):
    # Resize image for speed
    image = image.resize((384, 384))

    inputs = processor(image, return_tensors="pt").to(device)

    output = model.generate(
        **inputs,
        max_length=20,
        num_beams=1   # FAST
    )

    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

# -----------------------------
# TRANSLATION (LIGHTWEIGHT)
# -----------------------------
def translate_caption(caption, lang):
        return caption
    # try:
        # translated = translator.translate(caption, dest=lang)
        # return translated.text
    # except:
        # return caption  # fallback if API fails

# -----------------------------
# API ENDPOINT
# -----------------------------
@app.post("/predict")
def predict(file: UploadFile = File(...), lang: str = "en"):
    try:
        print("Request received")

        image = Image.open(io.BytesIO(file.file.read())).convert("RGB")

        caption_en = generate_caption(image)

        return {
            "caption_en": caption_en,
            "caption": caption_en,
            "language": lang
        }

    except Exception as e:
        print("ERROR:", e)
        return {"error": str(e)}