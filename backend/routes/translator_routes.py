from flask import Blueprint, jsonify, request
import requests
import json

translator_bp = Blueprint('translator_bp', __name__)

# Multiple translation service options
def translate_with_libretranslate(text, source_lang, target_lang):
    """Use LibreTranslate (free, open-source) API"""
    try:
        # Using public LibreTranslate instance
        url = "https://libretranslate.de/translate"
        payload = {
            "q": text,
            "source": source_lang,
            "target": target_lang,
            "format": "text"
        }
        response = requests.post(url, data=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("translatedText", text)
        return None
    except Exception as e:
        print(f"LibreTranslate error: {e}")
        return None

def translate_with_mymemory(text, source_lang, target_lang):
    """Fallback to MyMemory API"""
    try:
        url = f"https://api.mymemory.translated.net/get"
        params = {
            "q": text,
            "langpair": f"{source_lang}|{target_lang}"
        }
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("responseStatus") == 200:
                return data.get("responseData", {}).get("translatedText", text)
        return None
    except Exception as e:
        print(f"MyMemory error: {e}")
        return None

def translate_with_google_translate_api(text, source_lang, target_lang):
    """Using Google Translate (unofficial API)"""
    try:
        # Using a free Google Translate API wrapper
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": source_lang,
            "tl": target_lang,
            "dt": "t",
            "q": text
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                if data and isinstance(data, list) and len(data) > 0:
                    if isinstance(data[0], list) and len(data[0]) > 0:
                        translated = ''.join([item[0] for item in data[0] if isinstance(item, list) and len(item) > 0 and item[0]])
                        if translated:
                            return translated
            except (ValueError, IndexError, TypeError) as e:
                print(f"Error parsing Google Translate response: {e}")
        return None
    except Exception as e:
        print(f"Google Translate error: {e}")
        return None

@translator_bp.route("/api/translate", methods=["POST"])
def translate_text():
    """Translate text from source language to target language"""
    try:
        data = request.json
        text = data.get("text", "").strip()
        source_lang = data.get("source_lang", "en")
        target_lang = data.get("target_lang", "es")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if source_lang == target_lang:
            return jsonify({
                "translated_text": text,
                "original_text": text,
                "source_lang": source_lang,
                "target_lang": target_lang
            })
        
        # Try multiple translation services in order
        translated_text = None
        
        # Try Google Translate first (usually best quality)
        translated_text = translate_with_google_translate_api(text, source_lang, target_lang)
        
        # Fallback to LibreTranslate
        if not translated_text:
            translated_text = translate_with_libretranslate(text, source_lang, target_lang)
        
        # Fallback to MyMemory
        if not translated_text:
            translated_text = translate_with_mymemory(text, source_lang, target_lang)
        
        if translated_text:
            return jsonify({
                "translated_text": translated_text,
                "original_text": text,
                "source_lang": source_lang,
                "target_lang": target_lang,
                "success": True
            })
        else:
            return jsonify({
                "error": "Translation service unavailable. Please try again later.",
                "original_text": text
            }), 503
            
    except Exception as e:
        print(f"Translation error: {e}")
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

@translator_bp.route("/api/translate/detect", methods=["POST"])
def detect_language():
    """Detect the language of the input text"""
    try:
        data = request.json
        text = data.get("text", "").strip()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Simple language detection using Google Translate
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": "auto",
            "tl": "en",
            "dt": "t",
            "q": text
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                detected_lang = data[2] if len(data) > 2 else "en"
                return jsonify({
                    "detected_language": detected_lang,
                    "confidence": 0.95
                })
            except:
                return jsonify({"detected_language": "en", "confidence": 0.5})
        
        return jsonify({"detected_language": "en", "confidence": 0.5})
        
    except Exception as e:
        print(f"Language detection error: {e}")
        return jsonify({"detected_language": "en", "confidence": 0.5})

