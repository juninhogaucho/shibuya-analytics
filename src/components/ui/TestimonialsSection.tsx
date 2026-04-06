import { motion } from 'motion/react'

interface Testimonial {
  quote: string
  author: string
  role: string
  stat?: string
  avatar?: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I thought my issue was strategy. It wasn't. Shibuya showed that most of the damage came after the first red Nifty options trade, not from the setup itself.",
    author: 'Rohan S.',
    role: 'Retail F&O trader, Bengaluru',
    stat: 'Cut behavioural leak by 61%',
  },
  {
    quote:
      "The edge portfolio killed my illusions fast. My favourite BankNifty impulse setup was the one quietly draining the account every week.",
    author: 'Karthik R.',
    role: 'Prop-eval trader, Chennai',
    stat: 'Stopped 3 recurring loss patterns',
  },
  {
    quote:
      "The reset brief gave me an actual next-session mandate, not motivation content. That was the first time I felt like the product understood how I really trade.",
    author: 'Aman P.',
    role: 'Index options trader, Delhi',
    stat: 'Turned the board into a weekly ritual',
  },
]

export const TestimonialsSection = () => {
  return (
    <section className="landing-section py-24 bg-[#020204]">
      <div className="landing-container max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase">
            Real Results
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            What Traders Are Saying
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real feedback from traders who stopped losing to themselves
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="relative p-8 rounded-2xl bg-[#0A0A0F] border border-white/5 hover:border-blue-500/30 transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-6 right-6 text-white/5 text-8xl font-serif leading-none select-none pointer-events-none group-hover:text-blue-500/10 transition-colors">
                "
              </div>

              <div className="relative z-10 mb-8">
                <p className="text-gray-300 text-lg leading-relaxed font-medium">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              {testimonial.stat && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {testimonial.stat}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
