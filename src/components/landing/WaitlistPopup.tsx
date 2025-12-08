import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistPopup: React.FC<WaitlistPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send to FormSubmit (free email service)
      const formData = new FormData();
      formData.append('email', email);
      formData.append('_subject', '🚀 New Waitlist Signup - Shibuya Analytics');
      formData.append('message', `New waitlist signup: ${email}`);

      const response = await fetch('https://formsubmit.co/ajax/support@shibuya-analytics.com', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setError('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-8 relative">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                      Join the Waitlist
                    </h2>
                    <p className="text-neutral-400 text-sm">
                      Get early access to new features and exclusive updates.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </motion.button>
                  </form>

                  <p className="text-xs text-neutral-500 text-center mt-4">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">
                    You're on the list!
                  </h2>
                  <p className="text-neutral-400 text-sm mb-6">
                    We'll notify you when we have updates.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WaitlistPopup;
