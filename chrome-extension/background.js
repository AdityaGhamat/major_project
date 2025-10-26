let mediaRecorder;
let chunks = [];

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "START_RECORDING") {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob, "meeting.webm");

        // send to your local Whisper API
        await fetch("http://localhost:8000/transcribe", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Transcription:", data.transcript);
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon128.png",
              title: "Transcription Complete",
              message: "Click to view your transcript in the dashboard",
            });
          });
      };

      mediaRecorder.start();
    });
  }

  if (message.type === "STOP_RECORDING" && mediaRecorder) {
    mediaRecorder.stop();
  }
});
