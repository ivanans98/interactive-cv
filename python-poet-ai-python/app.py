from __future__ import annotations
from flask import Flask, render_template, request, jsonify
from poetry import generate_poem

app = Flask(__name__)

@app.get('/')
def home():
    return render_template('index.html')

@app.post('/api/poem')
def api_poem():
    data = request.get_json(silent=True) or {}
    topic = (data.get('topic') or '').strip()
    style = (data.get('style') or 'free verse').strip()
    lines = int(data.get('lines') or 8)
    if not topic:
        return jsonify({'error': 'Please provide a topic'}), 400
    poem = generate_poem(topic, style=style, lines=lines)
    return jsonify({'topic': topic, 'poem': poem})
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
