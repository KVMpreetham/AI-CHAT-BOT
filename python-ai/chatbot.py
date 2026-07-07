import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import re
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import spacy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Pre-download NLTK data programmatically
NLTK_RESOURCES = ['punkt', 'wordnet', 'stopwords', 'omw-1.4']
for resource in NLTK_RESOURCES:
    try:
        if resource == 'punkt':
            nltk.data.find('tokenizers/punkt')
        elif resource == 'wordnet':
            nltk.data.find('corpora/wordnet')
        elif resource == 'stopwords':
            nltk.data.find('corpora/stopwords')
        elif resource == 'omw-1.4':
            nltk.data.find('corpora/omw-1.4')
    except LookupError:
        nltk.download(resource, quiet=True)

# Load spaCy model programmatically
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

from intents import INTENTS

# Initialize NLTK items
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    """
    Cleans, tokenizes, and lemmatizes input text
    """
    text = text.lower().strip()
    # Remove special characters but keep alphanumeric and spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    
    # Tokenize using NLTK
    tokens = word_tokenize(text)
    
    # Lemmatize and filter stopwords
    cleaned_tokens = []
    for token in tokens:
        if token not in stop_words:
            lemma = lemmatizer.lemmatize(token)
            cleaned_tokens.append(lemma)
            
    return cleaned_tokens

def classify_rule_based(message):
    """
    Rule-based intent detection using keyword substring and token overlap.
    """
    cleaned_message_tokens = preprocess_text(message)
    message_lower = message.lower()
    
    best_intent = "Unknown"
    max_score = 0.0
    
    # Perform spaCy parsing for syntactic dependency checking if needed,
    # but keyword similarity and overlaps are primary here.
    doc = nlp(message_lower)
    
    for intent_name, intent_data in INTENTS.items():
        if intent_name == "Unknown":
            continue
            
        score = 0.0
        keywords = intent_data["keywords"]
        
        # 1. Direct substring phrase matches (high weight)
        for keyword in keywords:
            if keyword in message_lower:
                # Award points based on length of keyword phrase
                phrase_len = len(keyword.split())
                score += 0.5 + (0.1 * phrase_len)
        
        # 2. Token overlap similarity (Jaccard-like weight)
        keyword_lemmas = [lemmatizer.lemmatize(kw.split()[-1]) for kw in keywords]
        overlap_count = 0
        for token in cleaned_message_tokens:
            if token in keyword_lemmas:
                overlap_count += 1
                
        if len(cleaned_message_tokens) > 0:
            overlap_score = overlap_count / len(cleaned_message_tokens)
            score += overlap_score * 0.4
            
        # Update best intent
        if score > max_score:
            max_score = score
            best_intent = intent_name
            
    # Set threshold for matching. If score is extremely low, fall back to Unknown.
    confidence = min(max_score, 1.0)
    if confidence < 0.2:
        best_intent = "Unknown"
        confidence = 0.0
        
    return best_intent, confidence

def get_llm_response(message):
    """
    Attempts to get classification and response from Gemini or OpenAI if keys are present.
    Returns: (intent, confidence, response) or None if keys are missing or API fails.
    """
    # 1. Try Gemini
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            
            prompt = f"""
            You are a customer support agent. Categorize the user query into one of these intents:
            Greeting, Refund, Order, Delivery, Payment, Contact, Product, Goodbye, Unknown.
            
            Also generate a professional response based on the category.
            - Greeting: Welcome them.
            - Refund: Standard returns in 30 days, unused, original package.
            - Order: Provide shipping lookup instructions using order ID.
            - Delivery: Standard 3-5 days, express 1-2 days. Free above $50.
            - Payment: We accept UPI, Cards, Net Banking, PayPal.
            - Contact: support@example.com / 1-800-555-0199.
            - Product: High-quality specs, 1-year warranty.
            - Goodbye: Polite sendoff.
            - Unknown: Polite explanation that you can't help with this custom request, offer support contact.

            Return your answer EXACTLY as a JSON object (no markdown, no quotes around json, just the raw json string):
            {{
                "intent": "<Intent>",
                "confidence": <float between 0.0 and 1.0>,
                "response": "<Your response text>"
            }}

            User Query: "{message}"
            """
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            # Parse json output
            response_text = response.text.strip()
            # Clean possible markdown surrounding block
            if response_text.startswith("```"):
                lines = response_text.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    response_text = "\n".join(lines[1:-1]).strip()
            
            data = json.loads(response_text)
            return data.get("intent", "Unknown"), data.get("confidence", 0.99), data.get("response")
        except Exception as e:
            print(f"Gemini API failure: {e}. Falling back...")
            
    # 2. Try OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            
            prompt = f"""
            Categorize the user query into one of these intents: Greeting, Refund, Order, Delivery, Payment, Contact, Product, Goodbye, Unknown.
            Also generate a professional customer support response based on the category.
            Return a JSON object containing keys 'intent' (string), 'confidence' (float), and 'response' (string).
            User Query: "{message}"
            """
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a customer support classification bot. Always output raw JSON format matching: {\"intent\": \"...\", \"confidence\": 0.9, \"response\": \"...\"}"},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            data = json.loads(completion.choices[0].message.content)
            return data.get("intent", "Unknown"), data.get("confidence", 0.99), data.get("response")
        except Exception as e:
            print(f"OpenAI API failure: {e}. Falling back...")
            
    return None

def process_query(message):
    """
    Main entry point for chatbot query processing.
    Checks LLM first, falls back to local rule-based NLP.
    """
    # 1. Attempt LLM classification
    llm_result = get_llm_response(message)
    if llm_result:
        intent, confidence, response = llm_result
        return {
            "intent": intent,
            "confidence": confidence,
            "response": response,
            "source": "llm"
        }
        
    # 2. Fall back to local rule-based NLP
    intent, confidence = classify_rule_based(message)
    response = INTENTS[intent]["response"]
    
    return {
        "intent": intent,
        "confidence": confidence,
        "response": response,
        "source": "rule-based"
    }
