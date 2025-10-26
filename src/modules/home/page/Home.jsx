import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  LogOut,
  FileText,
  Download,
  Clock,
  CheckSquare,
  User,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  Settings,
  Volume2,
} from "lucide-react";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");
  const [showSettings, setShowSettings] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [audioSource, setAudioSource] = useState("both"); // 'mic', 'system', 'both'

  const transcriptEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleLogin = () => {
    if (loginForm.email && loginForm.password) {
      setIsAuthenticated(true);
      setMeetingHistory([
        {
          id: 1,
          title: "Team Standup",
          date: "2025-10-05",
          duration: "15 min",
          summary:
            "Discussed sprint progress and blockers. Team is on track for release.",
          actionItems: ["Update JIRA tickets", "Review PR #234"],
        },
        {
          id: 2,
          title: "Client Review",
          date: "2025-10-03",
          duration: "45 min",
          summary: "Presented Q3 results. Client satisfied with deliverables.",
          actionItems: ["Send invoice", "Schedule Q4 planning"],
        },
      ]);
    }
  };

  const getSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    return (
      candidates.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || ""
    );
  };

  const startRecording = async () => {
    try {
      setRecordingStatus("Requesting permissions...");
      audioChunksRef.current = [];

      let audioStream;
      let audioContext; // hold reference so we can close it on stop

      if (audioSource === "mic") {
        // Microphone only
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        if (!micStream.getAudioTracks().length) {
          throw new Error("No microphone audio track available.");
        }
        audioStream = micStream;
        setRecordingStatus("Recording from microphone");
      } else if (audioSource === "system") {
        // System audio only (requires getDisplayMedia)
        try {
          const sysStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true, // important: request audio as boolean
            video: true, // many browsers require video to allow audio capture
          });

          // Stop video track if we only want audio
          const videoTrack = sysStream.getVideoTracks()[0];
          if (videoTrack) videoTrack.stop();

          if (!sysStream.getAudioTracks().length) {
            throw new Error(
              "No system audio track. When sharing, pick a tab/window with sound and enable 'Share tab audio'."
            );
          }

          audioStream = sysStream;
          setRecordingStatus("Recording system audio");
        } catch (err) {
          alert(
            "System audio capture needs screen-sharing permission. Select a tab/window and enable 'Share tab audio'."
          );
          throw err;
        }
      } else {
        // Both microphone and system audio
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          const systemStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true,
          });

          // Stop video track (we only need audio)
          const videoTrack = systemStream.getVideoTracks()[0];
          if (videoTrack) videoTrack.stop();

          // Mix only the sources that actually have audio tracks
          audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();

          if (micStream.getAudioTracks().length) {
            const micSource = audioContext.createMediaStreamSource(micStream);
            micSource.connect(destination);
          }
          if (systemStream.getAudioTracks().length) {
            const sysSource =
              audioContext.createMediaStreamSource(systemStream);
            sysSource.connect(destination);
          }

          audioStream = destination.stream;

          if (!audioStream.getAudioTracks().length) {
            throw new Error(
              "No audio tracks found. Ensure mic access is granted and, for system audio, enable 'Share tab audio'."
            );
          }

          setRecordingStatus("Recording microphone + system audio");
        } catch (err) {
          alert(
            "Combined audio capture requires both microphone and screen-sharing permissions."
          );
          throw err;
        }
      }

      // Save stream
      streamRef.current = audioStream;

      // Create MediaRecorder with a supported mime type
      const mime = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(
        audioStream,
        mime ? { mimeType: mime } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setRecordingStatus("Processing audio...");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mime || "audio/webm",
        });
        await sendAudioToBackend(audioBlob);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        // Close audio context if we created one
        if (audioContext) {
          try {
            await audioContext.close();
          } catch {}
        }
      };

      // Start recording with chunks every 5 seconds for real-time transcription
      mediaRecorder.start(5000);
      setIsRecording(true);
      setTranscript("");
      setSummary("");
      setActionItems([]);
      setSentiment(null);
      setCurrentMeeting({
        title: "New Meeting",
        startTime: new Date(),
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      setRecordingStatus("Error: " + error.message);
      alert("Failed to start recording: " + error.message);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingStatus("Stopped");
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    try {
      setRecordingStatus("Transcribing audio...");

      const formData = new FormData();
      // Keep .webm extension; most backends just need a file
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch(`${backendUrl}/transcribe`, {
        method: "POST",
        body: formData,
      });

      // Read body safely (JSON or text)
      const contentType = response.headers.get("content-type") || "";
      const rawBody = await (contentType.includes("application/json")
        ? response.json()
        : response.text());

      if (!response.ok) {
        const bodySnippet =
          typeof rawBody === "string"
            ? rawBody.slice(0, 400)
            : JSON.stringify(rawBody).slice(0, 400);
        throw new Error(
          `HTTP ${response.status} ${response.statusText}. Response: ${bodySnippet}`
        );
      }

      // Normalize data if server sent plain text by mistake
      const data =
        typeof rawBody === "string"
          ? (() => {
              try {
                return JSON.parse(rawBody);
              } catch {
                return { transcript: rawBody }; // fallback: treat text as transcript
              }
            })()
          : rawBody;

      if (!data || typeof data.transcript !== "string") {
        throw new Error(
          `Unexpected response shape from /transcribe. Expected { transcript: string }. Got: ${
            typeof rawBody === "string"
              ? rawBody.slice(0, 400)
              : JSON.stringify(rawBody).slice(0, 400)
          }`
        );
      }

      // ✅ Update transcript
      setTranscript((prev) => `${prev ? prev + " " : ""}${data.transcript}`);

      // Trigger summary/action extraction
      setTimeout(() => {
        generateSummaryAndActions(data.transcript);
      }, 1000);

      setRecordingStatus("Transcription complete");
    } catch (error) {
      console.error("Transcription error:", error);
      setRecordingStatus("Error: " + error.message);
      // Show the real error instead of the generic message
      alert("Transcription failed: " + error.message);
    }
  };

  const generateSummaryAndActions = (transcriptText) => {
    // Generate summary
    setSummary(
      "The meeting covered key discussion points from the transcription. Important decisions were made and tasks were assigned to team members with specific deadlines."
    );

    // Extract potential action items (simple keyword-based extraction)
    const actionKeywords = [
      "will",
      "should",
      "need to",
      "must",
      "todo",
      "action",
    ];
    const sentences = transcriptText.split(/[.!?]+/);
    const detectedActions = [];

    sentences.forEach((sentence, idx) => {
      const lowerSentence = sentence.toLowerCase();
      if (actionKeywords.some((keyword) => lowerSentence.includes(keyword))) {
        detectedActions.push({
          id: idx,
          task: sentence.trim(),
          deadline: "TBD",
          assignee: "Team Member",
        });
      }
    });

    if (detectedActions.length > 0) {
      setActionItems(detectedActions.slice(0, 5)); // Limit to 5 items
    } else {
      setActionItems([
        {
          id: 1,
          task: "Follow up on meeting discussion",
          deadline: "Next Week",
          assignee: "Team",
        },
      ]);
    }

    // Generate sentiment (random for demo)
    setSentiment({
      positive: 60 + Math.floor(Math.random() * 20),
      neutral: 20 + Math.floor(Math.random() * 15),
      negative: 5 + Math.floor(Math.random() * 10),
    });

    // Add to meeting history
    const newMeeting = {
      id: Date.now(),
      title: currentMeeting.title,
      date: currentMeeting.startTime.toISOString().split("T")[0],
      duration:
        Math.floor((new Date() - currentMeeting.startTime) / 60000) + " min",
      summary: "Meeting transcribed and analyzed successfully.",
      actionItems: detectedActions.slice(0, 3).map((a) => a.task),
    };
    setMeetingHistory((prev) => [newMeeting, ...prev]);
  };

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleExportPDF = () => {
    alert(
      "Exporting to PDF... (This would trigger a download in the actual implementation)"
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-600 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI Meeting Summarizer
            </h1>
            <p className="text-gray-600">
              Transform your meetings into actionable insights
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <p className="text-center mt-4 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              AI Meeting Summarizer
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{loginForm.email}</span>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backend URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="http://localhost:8000"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make sure your FastAPI backend is running
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Source
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={audioSource}
                  onChange={(e) => setAudioSource(e.target.value)}
                >
                  <option value="mic">Microphone Only</option>
                  <option value="system">System Audio Only</option>
                  <option value="both">Both (Microphone + System Audio)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {audioSource === "system" || audioSource === "both"
                    ? "⚠️ System audio requires screen sharing permission"
                    : "🎤 Records from your microphone"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-4`}
        >
          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveTab("live");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "live"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Mic className="w-5 h-5" />
              <span className="font-medium">Live Meeting</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "history"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">History</span>
            </button>
          </nav>

          {meetingHistory.length > 0 && activeTab === "history" && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Recent Meetings
              </h3>
              <div className="space-y-2">
                {meetingHistory.slice(0, 5).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium text-sm text-gray-800">
                      {meeting.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {meeting.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 p-6">
          {activeTab === "live" ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Live Meeting
                  </h2>
                  {isRecording && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-600">
                        Recording
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    {audioSource === "mic" && <Mic className="w-4 h-4" />}
                    {audioSource === "system" && (
                      <Volume2 className="w-4 h-4" />
                    )}
                    {audioSource === "both" && (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>+</span>
                        <Volume2 className="w-4 h-4" />
                      </>
                    )}
                    <span>
                      {audioSource === "mic" && "Microphone"}
                      {audioSource === "system" && "System Audio"}
                      {audioSource === "both" && "Mic + System Audio"}
                    </span>
                  </div>

                  <button
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    className={`flex items-center space-x-3 px-8 py-4 rounded-full font-semibold text-white transition-all transform hover:scale-105 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-6 h-6" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>

                  {recordingStatus && (
                    <div className="text-sm text-gray-600 mt-2">
                      {recordingStatus}
                    </div>
                  )}
                </div>

                {isRecording && currentMeeting && (
                  <div className="text-center text-sm text-gray-600">
                    Started at {currentMeeting.startTime.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {(transcript || isRecording) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Live Transcript
                    </h3>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {transcript || "Waiting for audio..."}
                    </p>
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              )}

              {summary && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Summary
                      </h3>
                      <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Export PDF</span>
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{summary}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Action Items
                      </h3>
                      <CheckSquare className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {actionItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {item.task}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>👤 {item.assignee}</span>
                              <span>📅 {item.deadline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sentiment && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Sentiment Analysis
                    </h3>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-green-600">
                          Positive
                        </span>
                        <span className="text-sm font-semibold">
                          {sentiment.positive}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${sentiment.positive}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          Neutral
                        </span>
                        <span className="text-sm font-semibold">
                          {sentiment.neutral}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-500 h-2 rounded-full"
                          style={{ width: `${sentiment.neutral}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-red-600">
                          Negative
                        </span>
                        <span className="text-sm font-semibold">
                          {sentiment.negative}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${sentiment.negative}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Meeting History
              </h2>
              {meetingHistory.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📅 {meeting.date}</span>
                        <span>⏱️ {meeting.duration}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleExportPDF}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <p className="text-gray-700 mb-3">{meeting.summary}</p>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Action Items:
                    </p>
                    <ul className="space-y-1">
                      {meeting.actionItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 flex items-center space-x-2"
                        >
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
