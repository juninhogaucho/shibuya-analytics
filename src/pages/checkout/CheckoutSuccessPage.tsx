import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Clock, ArrowRight, KeyRound } from 'lucide-react'
import Navbar from '../../components/landing/Navbar'
import Footer from '../../components/landing/Footer'

interface OrderInfo {
  name: string
  email: string
  plan: string
  orderId?: string
  sessionId?: string
  timestamp: string
}

const CheckoutSuccessPage: React.FC = () => {
  const [order] = useState<OrderInfo | null>(() => {
    const storedOrder = localStorage.getItem('shibuya_order')
    if (storedOrder) {
      localStorage.removeItem('shibuya_order')
      return JSON.parse(storedOrder)
    }
    return null
  })

  return (
    <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-24 md:py-32 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
        >
          Checkout Complete
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-neutral-400 mb-8"
        >
          Thank you for your order{order?.name ? `, ${order.name.split(' ')[0]}` : ''}. The next step is activation, not waiting.
        </motion.p>

        {order?.orderId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Your order code</h3>
                <p className="text-sm text-neutral-300 font-mono">{order.orderId}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  Keep this code. Use it with your email on the activation page if the confirmation email takes a moment to arrive.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-8 mb-8 text-left"
        >
          <h3 className="font-semibold text-white mb-6">What happens now?</h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Confirmation Email</h4>
                <p className="text-sm text-neutral-400">
                  Check your inbox{order?.email ? ` at ${order.email}` : ''}. We send your order code and activation instructions there as payment settles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Activate Your Account</h4>
                <p className="text-sm text-neutral-400">
                  Go to activation, enter your email and order code, and unlock the live trader workspace.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Upload And Start</h4>
                <p className="text-sm text-neutral-400">
                  Upload your trade history inside the workspace, then use history, alerts, edge analysis, and prescriptions directly.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/activate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              Activate Live Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:bg-white hover:text-black text-white font-semibold rounded-xl transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-sm text-neutral-500">
            Questions? Contact us at{' '}
            <a href="mailto:support@shibuya-analytics.com" className="text-indigo-400 hover:underline">
              support@shibuya-analytics.com
            </a>
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

export default CheckoutSuccessPage
