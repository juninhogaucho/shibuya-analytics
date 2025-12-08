import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, User, MessageSquare, Upload, FileText, X, CreditCard } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

// Plan configuration - using Stripe Payment Links (no backend required)
const PLANS = {
  basic: {
    name: 'The Reality Check',
    price: 99,
    // Replace with your Stripe Payment Link for €99 product
    paymentLink: import.meta.env.VITE_STRIPE_LINK_BASIC || 'https://buy.stripe.com/8x28wI9O6bor63xaBt6sw00',
    description: 'Complete trading analysis report',
  },
  premium: {
    name: 'The Deep Dive',
    price: 149,
    // Replace with your Stripe Payment Link for €149 product
    paymentLink: import.meta.env.VITE_STRIPE_LINK_PREMIUM || 'https://buy.stripe.com/28EcMY1hA0JN0Jd8tl6sw01',
    description: 'Two reports + two 1:1  calls',
  },
};

interface CheckoutForm {
  name: string;
  email: string;
  discord: string;
  referral: string;
}

const CheckoutPage: React.FC = () => {
  const { plan } = useParams<{ plan: string }>();
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    email: '',
    discord: '',
    referral: '',
  });

  const currentPlan = PLANS[plan as keyof typeof PLANS] || PLANS.basic;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send data via FormSubmit (free email service, no backend needed)
  const sendDataToEmail = async (): Promise<boolean> => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('discord', form.discord || 'Not provided');
    formData.append('referral', form.referral || 'None');
    formData.append('plan', currentPlan.name);
    formData.append('price', `€${currentPlan.price}`);
    formData.append('_subject', `New Order: ${currentPlan.name} - ${form.name}`);
    
    if (csvFile) {
      formData.append('attachment', csvFile);
    }

    try {
      // FormSubmit.co - free email API (first time use will require email confirmation)
      const response = await fetch('https://formsubmit.co/ajax/support@shibuya-analytics.com', {
        method: 'POST',
        body: formData,
      });
      return response.ok;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      alert('Please upload your trade history CSV file');
      return;
    }

    setLoading(true);

    try {
      // 1. Send order data + CSV to email
      const emailSent = await sendDataToEmail();
      if (!emailSent) {
        console.warn('Email may not have been sent, but continuing to payment');
      }

      // 2. Store order info in localStorage for success page
      localStorage.setItem('shibuya_order', JSON.stringify({
        name: form.name,
        email: form.email,
        plan: currentPlan.name,
        timestamp: new Date().toISOString(),
      }));

      // 3. Redirect to Stripe Payment Link with prefilled email
      const paymentUrl = new URL(currentPlan.paymentLink);
      paymentUrl.searchParams.set('prefilled_email', form.email);
      window.location.href = paymentUrl.toString();

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again or contact support@shibuya-analytics.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <div className="mb-8">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Complete Your Order</h1>
          <p className="text-neutral-400">Upload your trades and we'll get to work on your analysis</p>
        </div>

        {/* Selected Plan Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-white text-lg">{currentPlan.name}</h3>
              <p className="text-sm text-neutral-400">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white font-mono">€{currentPlan.price}</span>
              <p className="text-xs text-neutral-500">one-time</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Personal Info */}
          <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Your Details
            </h3>
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-neutral-500 mt-1">We'll send your report here</p>
              </div>

              {/* Discord (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discord Username <span className="text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="discord"
                  value={form.discord}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="username"
                />
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">
                  Referral Code <span className="text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="referral"
                  value={form.referral}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="Enter code if you have one"
                />
              </div>
            </div>
          </div>

          {/* CSV Upload */}
          <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload Your Trade History
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              Export your trades as CSV from your broker/platform. We accept exports from most major platforms.
            </p>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : csvFile
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {csvFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-green-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{csvFile.name}</p>
                    <p className="text-xs text-neutral-400">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                  <p className="text-neutral-300 mb-1">
                    Drag & drop your CSV file here
                  </p>
                  <p className="text-sm text-neutral-500">
                    or click to browse
                  </p>
                </>
              )}
            </div>

            {!csvFile && (
              <p className="text-xs text-neutral-500 mt-3 text-center">
                Need help exporting? Check our guides for MT4, MT5, TradingView, and more.
              </p>
            )}
          </div>

          {/* What happens next */}
          <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6">
            <h4 className="font-medium text-white mb-4">What happens next?</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-indigo-400 font-bold">1</span>
                </div>
                <p className="text-neutral-400">Complete payment via Stripe (secure checkout)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-indigo-400 font-bold">2</span>
                </div>
                <p className="text-neutral-400">We analyze your trades within 72 hours</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-indigo-400 font-bold">3</span>
                </div>
                <p className="text-neutral-400">Receive your detailed PDF report via email</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading || !csvFile}
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay €{currentPlan.price} & Submit
              </>
            )}
          </motion.button>

          <p className="text-xs text-center text-neutral-500">
            By proceeding, you agree to our{' '}
            <Link to="/terms" className="text-indigo-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>
          </p>
        </motion.form>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
