import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const [contactForm, setContactForm] = useState({ email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send email via API (will be handled by backend)
      const response = await fetch(`${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8001'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactForm.email,
          message: contactForm.message,
          source: 'footer_contact'
        })
      });

      if (response.ok) {
        setContactSubmitted(true);
        setContactForm({ email: '', message: '' });
      } else {
        // Fallback to mailto
        const subject = encodeURIComponent('Contact from Shibuya Analytics');
        const body = encodeURIComponent(`From: ${contactForm.email}\n\n${contactForm.message}`);
        window.open(`mailto:support@shibuya-analytics.com?subject=${subject}&body=${body}`, '_blank');
        setContactSubmitted(true);
        setContactForm({ email: '', message: '' });
      }
    } catch {
      // Fallback to mailto on network error
      const subject = encodeURIComponent('Contact from Shibuya Analytics');
      const body = encodeURIComponent(`From: ${contactForm.email}\n\n${contactForm.message}`);
      window.open(`mailto:support@shibuya-analytics.com?subject=${subject}&body=${body}`, '_blank');
      setContactSubmitted(true);
      setContactForm({ email: '', message: '' });
    }
    
    setIsSubmitting(false);
  };

  return (
    <footer className="relative py-20 bg-[#020203] border-t border-white/[0.05] z-10 overflow-hidden">
      {/* Background - Shibuya Crossing vibe */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-[#020203]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-20">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold bg-white text-black">
                S
              </div>
              <span className="text-sm font-bold text-white tracking-wide">shibuya</span>
            </div>
            <p className="text-neutral-500 text-sm mb-8 max-w-sm leading-relaxed">
              Institutional-grade mathematics, for everyone. Make trading great again.
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@shibuya-analytics.com" className="hover:text-white transition-colors">
                support@shibuya-analytics.com
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-6 text-white">Contact Us</h3>
            {contactSubmitted ? (
               <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Message received. We'll be in touch.
               </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <textarea
                    placeholder="How can we help?"
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/[0.05]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-neutral-600 gap-4">
                <p>&copy; 2025 Shibuya Analytics. All rights reserved.</p>
                <div className="flex gap-8">
                    <a href="/privacy" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
                </div>
            </div>

            {/* LEGAL DISCLAIMER - MANDATORY FOR TRADING APPS */}
            <div className="mt-8 text-[10px] leading-relaxed text-neutral-700 max-w-4xl">
                <p>
                    RISK DISCLOSURE: Trading foreign exchange on margin carries a high level of risk, and may not be suitable for all investors.
                    The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange you should carefully
                    consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of
                    some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.
                </p>
                <p className="mt-2">
                    Shibuya Analytics is an educational analysis tool and does not provide financial advice. Past performance is not indicative of future results.
                </p>
            </div>
        </div>
      </div>
    </footer>
  );
};

// Helper for success state
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default Footer;
