import os
import string
import random
from flask import Flask, send_file, make_response
from io import BytesIO

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/health')
def health():
    return {"status": "ok"}, 200

@app.route('/download')
def download():
    # Generate exactly 10240 bytes of random text (10 KB)
    random_text = ''.join(random.choices(string.ascii_letters + string.digits, k=10240))
    byte_io = BytesIO()
    byte_io.write(random_text.encode('utf-8'))
    byte_io.seek(0)
    response = make_response(send_file(byte_io, as_attachment=True, download_name='random.txt', mimetype='text/plain'))
    response.headers['Content-Disposition'] = 'attachment; filename=random.txt'
    return response

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
