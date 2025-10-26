let recording = false;
const recordBtn = document.getElementById("recordBtn");
const statusEl = document.getElementById("status");

recordBtn.addEventListener("click", async () => {
  if (!recording) {
    chrome.runtime.sendMessage({ type: "START_RECORDING" });
    recordBtn.textContent = "⏹️ Stop Recording";
    statusEl.textContent = "Recording in progress...";
    recording = true;
  } else {
    chrome.runtime.sendMessage({ type: "STOP_RECORDING" });
    recordBtn.textContent = "🎙️ Start Recording";
    statusEl.textContent = "Recording stopped.";
    recording = false;
  }
});
