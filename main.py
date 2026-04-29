from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch

from transformers import BlipProcessor, BlipForConditionalGeneration
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

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
# LOAD MODELS (ONLY ONCE)
# -----------------------------
print("Loading BLIP model...")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
).to(device)

print("Loading Translation model...")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")
translator = M2M100ForConditionalGeneration.from_pretrained(
    "facebook/m2m100_418M"
).to(device)

print("All models loaded successfully!")

# -----------------------------
# CAPTION FUNCTION (IMPROVED)
# -----------------------------
def generate_caption(image):
    inputs = processor(image, return_tensors="pt").to(device)

    output = model.generate(
        **inputs,
        max_length=30,
        num_beams=5,
        repetition_penalty=1.5,
        no_repeat_ngram_size=2,
        early_stopping=True
    )

    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

# -----------------------------
# TRANSLATION FUNCTION
# -----------------------------
def translate_caption(caption, lang_code):
    if lang_code == "en":
        return caption

    tokenizer.src_lang = "en"
    encoded = tokenizer(caption, return_tensors="pt").to(device)

    generated_tokens = translator.generate(
        **encoded,
        forced_bos_token_id=tokenizer.get_lang_id(lang_code)
    )

    translated = tokenizer.batch_decode(
        generated_tokens, skip_special_tokens=True
    )[0]

    return translated

# -----------------------------
# API ENDPOINT
# -----------------------------
@app.post("/predict")
def predict(file: UploadFile = File(...), lang: str = "en"):
    try:
        print("Request received")

        image = Image.open(io.BytesIO(file.file.read())).convert("RGB")
        print("Image loaded")

        caption_en = generate_caption(image)
        print("Caption:", caption_en)

        caption_translated = translate_caption(caption_en, lang)

        return {
            "caption_en": caption_en,
            "caption": caption_translated,
            "language": lang
        }

    except Exception as e:
        print("ERROR:", e)
        return {"error": str(e)}