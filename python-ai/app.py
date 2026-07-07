import os
import sys
# Ensure the current directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import process_query

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

@app.route('/status', methods=['GET'])
def status():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "online",
        "service": "SupportAI NLP classifier"
    }), 200

@app.route('/classify', methods=['POST'])
def classify():
    """
    Classifies a customer support message to identify intent and response
    """
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "Missing 'message' in request body"}), 400
        
    message = data['message']
    
    try:
        result = process_query(message)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "error": "Failed to process query",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 8000))
    # Run the server on host 0.0.0.0 to allow docker/network access
    app.run(host='0.0.0.0', port=port, debug=False)
