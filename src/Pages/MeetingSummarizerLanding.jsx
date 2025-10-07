import React, { useState } from 'react';
import { Mic, FileText, Download, Zap, Clock, Users, CheckCircle, ArrowRight, Sparkles, PlayCircle } from 'lucide-react';

export default function MeetingSummarizerLanding() {
  const [formData, setFormData] = useState({ name: '', email: '', feedback: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', feedback: '' });
    }, 3000);
  };

  const steps = [
    { icon: Mic, title: "AI Joins Meeting", desc: "Add our AI agent to your Google Meet" },
    { icon: FileText, title: "Listens & Analyzes", desc: "AI transcribes and understands context" },
    { icon: Download, title: "Get Summary", desc: "Download organized meeting notes instantly" }
  ];

  const benefits = [
    { icon: Clock, title: "Save Time", desc: "No more manual note-taking during meetings" },
    { icon: Users, title: "Never Miss Details", desc: "Capture every important point and action item" },
    { icon: Zap, title: "Instant Summaries", desc: "Get structured meeting notes in seconds" },
    { icon: FileText, title: "Organized Output", desc: "Agenda, MOMs, and key points neatly formatted" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-indigo-100">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Chrome Extension</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Never Take Meeting<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Notes Again
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your AI-powered meeting assistant that joins Google Meet, listens attentively, and delivers comprehensive summaries instantly.
            </p>
            
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 border border-gray-200">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* What It Is Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What is AI Meeting Summarizer?</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                AI Meeting Summarizer is a powerful Chrome extension that revolutionizes how you handle Google Meet sessions. Our intelligent AI agent joins your meetings as a silent participant, carefully listening and analyzing every word.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                After the meeting ends, you'll instantly receive a professionally formatted document containing the agenda, minutes of meeting (MOMs), action items, and all key discussion points—ready to download and share.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 space-y-4">
              {['Real-time transcription', 'Smart context analysis', 'Automated formatting', 'One-click download'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-indigo-100 text-lg">Three simple steps to effortless meeting documentation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`bg-white rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    activeStep === idx ? 'transform -translate-y-2 shadow-2xl' : 'shadow-lg'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeStep === idx 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-110' 
                      : 'bg-indigo-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${activeStep === idx ? 'text-white' : 'text-indigo-600'}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-400 mb-2">0{idx + 1}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How to Use</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-6 max-w-3xl mx-auto">
          {[
            { step: '1', text: 'Install the Chrome extension from the Chrome Web Store' },
            { step: '2', text: 'Start or join your Google Meet session as usual' },
            { step: '3', text: 'Click the extension icon and add the AI agent to your meeting' },
            { step: '4', text: 'Conduct your meeting normally—the AI is listening' },
            { step: '5', text: 'Once the meeting ends, view your summary in the extension popup' },
            { step: '6', text: 'Download the formatted document with one click' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-lg">
                {item.step}
              </div>
              <p className="text-gray-700 text-lg pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">Transform your meeting experience with powerful benefits</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">We'd Love Your Feedback</h2>
            <p className="text-gray-600">Help us improve and shape the future of AI meeting summaries</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
              <textarea
                required
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
                placeholder="Share your thoughts, suggestions, or questions..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              {submitted ? '✓ Submitted!' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2">AI Meeting Summarizer</h3>
            <p className="text-gray-400">Smarter meetings, better outcomes</p>
          </div>
          <p className="text-gray-500 text-sm">© 2024 AI Meeting Summarizer. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}