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
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const sampleTranscripts = [
          "Let's discuss the Q4 marketing strategy.",
          "John will prepare the presentation by Friday.",
          "We need to increase our social media engagement.",
          "Sarah, please review the budget proposal.",
          "The deadline for the project is December 15th.",
        ];
        const randomText =
          sampleTranscripts[
            Math.floor(Math.random() * sampleTranscripts.length)
          ];
        setTranscript((prev) => prev + " " + randomText);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

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

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setSummary("");
    setActionItems([]);
    setSentiment(null);
    setCurrentMeeting({
      title: "New Meeting",
      startTime: new Date(),
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setTimeout(() => {
      setSummary(
        "The meeting focused on Q4 strategy, with emphasis on marketing initiatives and budget allocation. Key decisions were made regarding timeline and resource distribution. Team members were assigned specific tasks with clear deadlines."
      );
      setActionItems([
        {
          id: 1,
          task: "John to prepare presentation",
          deadline: "Friday",
          assignee: "John",
        },
        {
          id: 2,
          task: "Sarah to review budget proposal",
          deadline: "Next Week",
          assignee: "Sarah",
        },
        {
          id: 3,
          task: "Increase social media engagement",
          deadline: "Ongoing",
          assignee: "Marketing Team",
        },
      ]);
      setSentiment({ positive: 65, neutral: 25, negative: 10 });

      const newMeeting = {
        id: Date.now(),
        title: currentMeeting.title,
        date: currentMeeting.startTime.toISOString().split("T")[0],
        duration:
          Math.floor((new Date() - currentMeeting.startTime) / 60000) + " min",
        summary:
          "The meeting focused on Q4 strategy, with emphasis on marketing initiatives...",
        actionItems: [
          "John to prepare presentation",
          "Sarah to review budget proposal",
        ],
      };
      setMeetingHistory((prev) => [newMeeting, ...prev]);
    }, 2000);
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

                <div className="flex items-center justify-center py-8">
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
