/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Bolt, 
  Bell, 
  UserCircle, 
  Bot, 
  Ticket, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Home, 
  Lightbulb,
  ChevronDown,
  MapPin,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for the support ticket
interface TicketData {
  customerName: string;
  phoneNumber: string;
  email: string;
  wifiId: string;
  city: string;
  selectedIssues: string[];
  otherIssueDetails: string;
  remarks: string;
  ticketId: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

const RELEVANT_ISSUES = [
  "Internet Not Working",
  "Slow Speed",
  "Frequent Disconnection",
  "Router Configuration",
  "Billing Issue",
  "Other"
];

export default function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState<TicketData>({
    customerName: '',
    phoneNumber: '',
    email: '',
    wifiId: '',
    city: 'vaso',
    selectedIssues: [],
    otherIssueDetails: '',
    remarks: '',
    ticketId: ''
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Automatic WiFi ID logic: last 6 digits of phone number
      if (name === 'phoneNumber') {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length >= 6) {
          newData.wifiId = digitsOnly.slice(-6);
        }
      }
      
      return newData;
    });
  };

  // Handle issue checkbox changes
  const handleIssueToggle = (issue: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedIssues.includes(issue);
      const newIssues = isSelected 
        ? prev.selectedIssues.filter(i => i !== issue)
        : [...prev.selectedIssues, issue];
      
      return { ...prev, selectedIssues: newIssues };
    });
  };

  // Handle geolocation
  const handleGetLocation = () => {
    setIsLocating(true);
    console.log('Requesting geolocation...');
    
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location detected:', { latitude, longitude });
        setFormData(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude }
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error.message);
        setIsLocating(false);
      }
    );
  };

  // helper to send data to backend endpoint
  const sendToBackend = async (data: TicketData) => {
    try {
      const res = await fetch('http://localhost:5000/api/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log('Backend response:', result);
      return result;
    } catch (err) {
      console.error('Error sending to backend:', err);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate ticket ID
    const newTicketId = `ACT-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Add ticket ID to form data
    const dataToSend = { ...formData, ticketId: newTicketId };

    // Log values for future triggers as requested
    console.log('Form Submitted with values:', dataToSend);

    // send the payload to our local python endpoint
    await sendToBackend(dataToSend);

    // Set ticket ID for display
    setTicketId(newTicketId);

    // Show success screen
    setIsSubmitted(true);
  };

  // Handle dashboard redirection
  const handleGoToDashboard = () => {
    console.log('Redirecting to dashboard: https://www.actcorp.in/');
    window.open('https://www.actcorp.in/', '_blank');
  };

  // Handle other button clicks for logging
  const handleButtonClick = (action: string) => {
    console.log(`Button clicked: ${action}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f6] font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <div className="size-8 bg-[#ec5b13] rounded-lg flex items-center justify-center text-white">
              <Wifi size={20} />
              
            </div> */}
            <a href="https://www.actcorp.in" target="_blank" rel="noopener noreferrer">
              <img src="https://www.actcorp.in/themes/custom/actcorp/logo.svg" alt="Home" loading="eager" width="90" height="32"></img>
            </a>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
                Fibernet <span className="font-normal text-slate-500">| NetAssist Support</span>
              </h2>
            
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[580px]"
            >
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Form Header */}
                <div className="p-8 text-center border-b border-slate-100">
                  <div className="inline-flex items-center justify-center p-3 bg-[#ec5b13]/10 rounded-full mb-4">
                    <Bot className="text-[#ec5b13]" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-slate-900 mb-2">
                    NetAssist – Raise a Support Ticket
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Submit your broadband issue and our technical team will assist you shortly.
                  </p>
                </div>

                {/* Support Ticket Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Customer Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] h-12 px-4 transition-all" 
                        placeholder="Enter your full name" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Email Address</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] h-12 px-4 transition-all" 
                        placeholder="your@email.com" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel"
                        name="phoneNumber"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] h-12 px-4 transition-all" 
                        placeholder="Registered number" 
                      />
                      <p className="text-[10px] text-slate-400 italic">Last 6 digits will be used as WiFi ID</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">WiFi ID / Customer ID <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        name="wifiId"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={formData.wifiId}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] h-12 px-4 transition-all bg-slate-50" 
                        placeholder="Enter WiFi ID" 
                        title="WiFi ID must be exactly 6 digits"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">City Selection</label>
                      <div className="relative">
                        <select 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full appearance-none rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] h-12 px-4 transition-all bg-white"
                        >
                          <option value="bengaluru">Bengaluru</option>
                          <option value="chennai">Chennai</option>
                          <option value="ahmedabad">Ahmedabad</option>
                          <option value="nadiad">Nadiad</option>
                          <option value="vaso">Vaso</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Current Location</label>
                      <button 
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className={`w-full h-12 rounded-lg border border-dashed flex items-center justify-center gap-2 transition-all ${
                          formData.location 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-slate-300 hover:border-[#ec5b13] text-slate-500 hover:text-[#ec5b13]'
                        }`}
                      >
                        {isLocating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#ec5b13] border-t-transparent"></div>
                        ) : formData.location ? (
                          <><CheckCircle2 size={18} /> Location Captured</>
                        ) : (
                          <><MapPin size={18} /> Detect Location</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <AlertCircle size={16} className="text-[#ec5b13]" />
                      Select Issue(s)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {RELEVANT_ISSUES.map((issue) => (
                        <label 
                          key={issue}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.selectedIssues.includes(issue)
                              ? 'border-[#ec5b13] bg-[#ec5b13]/5'
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={formData.selectedIssues.includes(issue)}
                            onChange={() => handleIssueToggle(issue)}
                            className="rounded text-[#ec5b13] focus:ring-[#ec5b13]"
                          />
                          <span className="text-sm text-slate-700">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {formData.selectedIssues.includes('Other') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        <label className="text-sm font-semibold text-slate-700">Other Issue Details</label>
                        <textarea 
                          name="otherIssueDetails"
                          value={formData.otherIssueDetails}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] p-4 transition-all resize-none" 
                          placeholder="Please specify your issue..." 
                          rows={2}
                          required
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {formData.selectedIssues.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <MessageSquare size={16} className="text-[#ec5b13]" />
                        Remarks (Optional)
                      </label>
                      <textarea 
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-200 focus:ring-[#ec5b13] focus:border-[#ec5b13] p-4 transition-all resize-none" 
                        placeholder="Any additional comments..." 
                        rows={3}
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-[#ec5b13] hover:bg-[#d44d0f] text-white font-bold h-14 rounded-lg shadow-lg shadow-[#ec5b13]/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Ticket size={20} />
                    Raise Complaint Ticket
                  </button>
                </form>
              </div>

              {/* Troubleshooting Tip */}
              <div className="mt-8 bg-[#ec5b13]/5 rounded-xl p-4 flex gap-4 border border-[#ec5b13]/10">
                <Lightbulb className="text-[#ec5b13] shrink-0" size={24} />
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-[#ec5b13]">Pro Tip:</span> 80% of issues can be resolved by restarting your router for 30 seconds. Try this while you wait!
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8 md:p-12 text-center">
                {/* Success Icon */}
                <div className="mb-8 flex justify-center">
                  <div className="size-20 bg-[#ec5b13]/10 rounded-full flex items-center justify-center border-4 border-[#ec5b13]/5">
                    <CheckCircle2 className="text-[#ec5b13]" size={48} />
                  </div>
                </div>

                {/* Text Content */}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Thank you for raising a ticket!
                </h1>
                <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
                  We have received your request and our team will get back to you shortly.
                </p>

                {/* Ticket Info Card */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 inline-block w-full max-w-sm mb-12">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Your Ticket ID</span>
                    <p className="text-2xl font-mono font-bold text-[#ec5b13]">{ticketId}</p>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                      Status: Open
                    </div>
                  </div>
                </div>

                {/* Support Section */}
                <div className="grid md:grid-cols-2 gap-4 text-left mb-12">
                  <div 
                    onClick={() => handleButtonClick('email_support')}
                    className="p-4 rounded-lg border border-slate-100 bg-white flex items-start gap-4 shadow-sm cursor-pointer hover:border-[#ec5b13]/30 transition-all"
                  >
                    <div className="text-[#ec5b13] mt-1">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Email Support</h3>
                      <p className="text-sm text-slate-500">support@actcorp.in</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleButtonClick('call_support')}
                    className="p-4 rounded-lg border border-slate-100 bg-white flex items-start gap-4 shadow-sm cursor-pointer hover:border-[#ec5b13]/30 transition-all"
                  >
                    <div className="text-[#ec5b13] mt-1">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Quick Call</h3>
                      <p className="text-sm text-slate-500">+91 9824085934</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={handleGoToDashboard}
                    className="px-8 py-4 bg-[#ec5b13] text-white font-bold rounded-lg hover:bg-[#d44d0f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ec5b13]/20"
                  >
                    <Home size={18} />
                    Go to Dashboard
                  </button>
                  {/* <button 
                    onClick={() => {
                      handleButtonClick('view_status');
                      setIsSubmitted(false);
                    }}
                    className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-all"
                  >
                    View Ticket Status
                  </button> */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-6 text-center border-t border-slate-200 mt-auto bg-white/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-slate-500 text-sm mb-2">
            © {new Date().getFullYear()} ACT Fibernet Support Services. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs mb-6">
            created by <span className="font-semibold text-slate-600"><a href="https://www.linkedin.com/in/krunal-rana/" target="_blank">Krunal Rana</a></span> and powerd by <a href="https://bolna.ai/" target="_blank" rel="noopener noreferrer" className="text-[#ec5b13] hover:underline">bolna.ai</a>
          </p>
          <div className="flex justify-center gap-6">
            <button onClick={() => handleButtonClick('privacy')} className="text-xs text-slate-400 hover:text-[#ec5b13] transition-colors">Privacy Policy</button>
            <button onClick={() => handleButtonClick('terms')} className="text-xs text-slate-400 hover:text-[#ec5b13] transition-colors">Terms of Service</button>
            <button onClick={() => handleButtonClick('contact')} className="text-xs text-slate-400 hover:text-[#ec5b13] transition-colors">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
