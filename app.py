from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

# Homepage
@app.route('/')
def index():
    return render_template('index.html')

# WebSocket for broadcasting audio
@socketio.on('start_broadcast')
def handle_broadcast(data):
    # Broadcast audio data to all listeners
    socketio.emit('audio_stream', data)

# WebSocket for listening to broadcasts
@socketio.on('listen_broadcast')
def handle_listen():
    # Acknowledge connection
    socketio.emit('connected', {'status': 'success'})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
