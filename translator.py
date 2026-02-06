# translator.py
# Handles translation logic (business layer)

from googletrans import Translator

translator = Translator()

def translate_text(text, source, target):
    try:
        result = translator.translate(text, src=source, dest=target)
        return result.text
    except Exception as e:
        return "Translation Error"


