import streamlit as st
import torch
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

st.title("🌐 LENSCRIBE - Image Captioning App")

@st.cache_resource
def load_model():
    processor = BlipProcessor.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )
    model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )
    return processor, model

processor, model = load_model()

def generate_caption(image):
    image = image.resize((384, 384))
    inputs = processor(image, return_tensors="pt")

    out = model.generate(
        **inputs,
        max_length=20,
        num_beams=1
    )

    return processor.decode(out[0], skip_special_tokens=True)

uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "png", "jpeg"])

if uploaded_file:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image)

    if st.button("Generate Caption"):
        with st.spinner("Generating..."):
            caption = generate_caption(image)
            st.success(caption)