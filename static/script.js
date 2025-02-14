const socket = io();

// DOM Elements
const homepage = document.getElementById('homepage');
const broadcastSection = document.getElementById('broadcastSection');
const listenerSection = document.getElementById('listenerSection');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const gainControl = document.getElementById('gainControl');
const shareLink = document.getElementById('shareLink');
const audioPlayer = document.getElementById('audioPlayer');

let mediaRecorder;
let audioChunks = [];

// Start Broadcast
document.getElementById('startBroadcast').addEventListener('click', () => {
    homepage.classList.add('hidden');
    broadcastSection.classList.remove('hidden');
});

// Start Recording
startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                socket.emit('start_broadcast', event.data);
            }
        };

        mediaRecorder.start(1000); // Send data every second
        startButton.disabled = true;
        stopButton.disabled = false;

        // Generate shareable link
        const link = `${window.location.origin}/listen`;
        shareLink.textContent = `Share this link: ${link}`;
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
});

// Stop Recording
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
});

// Listen to Broadcast
document.getElementById('listenBroadcast').addEventListener('click', () => {
    homepage.classList.add('hidden');
    listenerSection.classList.remove('hidden');

    socket.emit('listen_broadcast');
    socket.on('audio_stream', (data) => {
        const audioBlob = new Blob([data], { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
    });
});

// Adjust Microphone Gain
gainControl.addEventListener('input', (event) => {
    const gain = event.target.value;
    if (mediaRecorder && mediaRecorder.stream) {
        const audioTrack = mediaRecorder.stream.getAudioTracks()[0];
        audioTrack.applyConstraints({ volume: gain });
    }
});
