from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.get_json()

    text = data.get("text", "").strip()
    source = data.get("source", "auto")
    target = data.get("target", "en")

    if not text:
        return jsonify({"translatedText": ""})

    # ✅ MyMemory DOES NOT support auto-detect
    # So we force English if auto is selected
    if source == "auto":
        source = "en"

    langpair = f"{source}|{target}"

    url = "https://api.mymemory.translated.net/get"
    params = {
        "q": text,
        "langpair": langpair
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        result = response.json()

        translated = result["responseData"]["translatedText"]

        return jsonify({
            "translatedText": translated
        })

    except Exception as e:
        print("Translation error:", e)
        return jsonify({
            "translatedText": "Translation failed. Please try again."
        })


if __name__ == "__main__":
    app.run(debug=True)
