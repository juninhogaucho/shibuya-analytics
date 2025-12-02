import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  const handleExploreDemo = () => {
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard')
  }

  return (
    <div className="landing">
      {/* ============================================
          HERO - Single clear message, one primary CTA
          ============================================ */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__headline">
            Stop losing money to your emotions.
          </h1>
          <p className="landing-hero__subhead">
            SHIBUYA analyzes your trades and shows you the exact dollar cost of every 
            revenge trade, every oversized position, every broken rule. Then we 
            prescribe exactly how to fix it.
          </p>
          <div className="landing-hero__cta">
            <button className="landing-btn landing-btn--primary" onClick={handleExploreDemo}>
              Explore Sample Data
            </button>
            <span className="landing-hero__note">See what the dashboard reveals on a real trader</span>
          </div>
        </div>
        
        {/* Social Proof Strip */}
        <div className="landing-proof">
          <div className="landing-proof__item">
            <span className="landing-proof__number">$1,847</span>
            <span className="landing-proof__label">Average monthly savings per user</span>
          </div>
          <div className="landing-proof__divider"></div>
          <div className="landing-proof__item">
            <span className="landing-proof__number">2.3 days</span>
            <span className="landing-proof__label">Faster slump recovery</span>
          </div>
          <div className="landing-proof__divider"></div>
          <div className="landing-proof__item">
            <span className="landing-proof__number">89%</span>
            <span className="landing-proof__label">Pass rate improvement on prop firms</span>
          </div>
        </div>
      </section>

      {/* ============================================
          PROBLEM - Articulate their pain clearly
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">The Problem</span>
          <h2>You already know how to trade. The problem is you.</h2>
          <p className="landing-section__subtitle">
            You have a strategy. You've backtested it. But somehow, you keep giving 
            money back to the market through mistakes you swore you wouldn't repeat.
          </p>
        </div>
        
        <div className="landing-problems">
          <div className="landing-problem">
            <div className="landing-problem__icon">🔥</div>
            <h3>Revenge Trading</h3>
            <p>That -$340 loss turns into -$892 because you "needed to get it back" before the day ended.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">📏</div>
            <h3>Size Violations</h3>
            <p>Your rules say 0.5R. Your gut says "this one's a winner" so you size up to 2R. It wasn't.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">⚡</div>
            <h3>Overtrading</h3>
            <p>3 trades per day was the plan. 11 trades later, you're wondering what happened.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">🎰</div>
            <h3>Dead Edges</h3>
            <p>That "Asian session setup" hasn't worked in months but you keep trading it anyway.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          THE MATH - Our differentiator (what others don't have)
          ============================================ */}
      <section className="landing-section landing-section--accent">
        <div className="landing-section__header">
          <span className="landing-eyebrow">The Math</span>
          <h2>Hedge fund quant tools. For retail traders.</h2>
          <p className="landing-section__subtitle">
            We didn't just build another trade journal. We built the behavioral analytics 
            stack Renaissance would use if they traded retail accounts.
          </p>
        </div>
        
        <div className="landing-math-grid">
          <div className="landing-math-card">
            <div className="landing-math-card__icon">🧠</div>
            <h3>Bayesian Hidden Markov Model</h3>
            <p>We model your psychological state as a statistical process. Are you in "PROFIT ROBOT 9000" mode or "TILTED DEGENERATE" mode? The math knows before you do.</p>
            <div className="landing-math-card__tech">BQL Engine • Expectation-Maximization • Viterbi Decoding</div>
          </div>
          <div className="landing-math-card">
            <div className="landing-math-card__icon">🎲</div>
            <h3>Monte Carlo Simulation</h3>
            <p>10,000 simulated futures. We bootstrap your actual trades to see where you're headed. Ruin probability. Prop firm pass rates. Drawdown distributions.</p>
            <div className="landing-math-card__tech">Block Bootstrap • Regime-Aware Sampling • Wilson Confidence</div>
          </div>
          <div className="landing-math-card">
            <div className="landing-math-card__icon">📏</div>
            <h3>Kelly Criterion Optimization</h3>
            <p>How much should you risk? Kelly knows. We calculate optimal position sizing with Bayesian priors so you don't overfit to small samples.</p>
            <div className="landing-math-card__tech">Bayesian Posterior • Fractional Kelly • Risk of Ruin</div>
          </div>
          <div className="landing-math-card">
            <div className="landing-math-card__icon">🏛️</div>
            <h3>Walk-Forward Validation</h3>
            <p>Every edge claim goes through "The Courthouse." Fisher-Z transforms, Benjamini-Hochberg FDR correction. If your edge isn't statistically valid, we tell you.</p>
            <div className="landing-math-card__tech">p-value Gating • False Discovery Control • Economic Threshold</div>
          </div>
        </div>
        
        <div className="landing-math-bottom">
          <p className="landing-math-tagline">
            This is the stack that separates us from Edgewonk, TraderVue, and every other journal. 
            <strong> They count trades. We model behavior.</strong>
          </p>
        </div>
      </section>

      {/* ============================================
          SOLUTION - What we do, simply stated
          ============================================ */}
      <section className="landing-section landing-section--dark">
        <div className="landing-section__header">
          <span className="landing-eyebrow">The Solution</span>
          <h2>We quantify your discipline tax. Then we eliminate it.</h2>
        </div>
        
        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature__number">01</div>
            <div className="landing-feature__content">
              <h3>Upload your trades</h3>
              <p>Export from MT4, MT5, cTrader, TradingView, or any broker. We normalize everything automatically.</p>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature__number">02</div>
            <div className="landing-feature__content">
              <h3>See your real costs</h3>
              <p>We separate luck from skill, then calculate the exact dollar amount you lost to each behavioral error. Not percentages. Dollars.</p>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature__number">03</div>
            <div className="landing-feature__content">
              <h3>Get specific prescriptions</h3>
              <p>Not "manage your emotions better." Real rules: "No trading GBP pairs after a loss. Max 3 trades until BQL score drops below 0.5."</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUE - Key benefits with specifics
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">What You Get</span>
          <h2>Tools that actually change behavior</h2>
        </div>
        
        <div className="landing-benefits">
          <div className="landing-benefit">
            <h3>💰 Discipline Tax Calculator</h3>
            <p>See exactly how much money revenge trades, overtrading, and size violations cost you last month. Down to the dollar.</p>
          </div>
          <div className="landing-benefit">
            <h3>📊 Edge Portfolio</h3>
            <p>Your strategies classified as PRIME, STABLE, or DECAYED. We tell you which to scale, which to bench, and which to kill.</p>
          </div>
          <div className="landing-benefit">
            <h3>🩺 Slump Prescription</h3>
            <p>When you're in a slump, we prescribe specific rules: position caps, banned pairs, mandatory cooldowns. Automatic risk management.</p>
          </div>
          <div className="landing-benefit">
            <h3>🥊 Shadow Boxing</h3>
            <p>Run your actual trades through prop firm rules. See if you'd pass FTMO, FundedNext, or The5ers before spending a dime on challenges.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING - Three tiers, clear value
          ============================================ */}
      <section className="landing-section landing-section--dark" id="pricing">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Pricing</span>
          <h2>Pick your path</h2>
        </div>
        
        <div className="landing-pricing landing-pricing--three">
          <div className="landing-price-card">
            <div className="landing-price-card__header">
              <h3>Edge Autopsy</h3>
              <div className="landing-price-card__price">
                <span className="landing-price-amount">$99</span>
                <span className="landing-price-type">one-time</span>
              </div>
            </div>
            <p className="landing-price-card__desc">
              A complete PDF diagnosis of your trading. Your discipline tax, your edge health, your prop firm readiness.
            </p>
            <ul className="landing-price-card__perks">
              <li>Full discipline tax breakdown</li>
              <li>Edge portfolio analysis</li>
              <li>Prop firm simulation snapshot</li>
              <li>Delivered within 72 hours</li>
            </ul>
            <a href="/checkout/steve" className="landing-btn landing-btn--secondary">
              Get Your Report
            </a>
          </div>

          <div className="landing-price-card landing-price-card--featured">
            <div className="landing-price-card__badge">Best Value</div>
            <div className="landing-price-card__header">
              <h3>Edge Autopsy Pro</h3>
              <div className="landing-price-card__price">
                <span className="landing-price-amount">$149</span>
                <span className="landing-price-type">one-time</span>
              </div>
            </div>
            <p className="landing-price-card__desc">
              Two reports, two 1:1 calls. For traders who want to actually talk through the findings with an expert.
            </p>
            <ul className="landing-price-card__perks">
              <li>Everything in Edge Autopsy</li>
              <li>Two PDF reports (before/after)</li>
              <li>Two 30-min coaching calls</li>
              <li>Priority queue</li>
              <li>Personalized rules preview</li>
            </ul>
            <a href="/checkout/steve-plus" className="landing-btn landing-btn--primary">
              Get Pro Report
            </a>
          </div>
          
          <div className="landing-price-card">
            <div className="landing-price-card__header">
              <h3>Full Access</h3>
              <div className="landing-price-card__price">
                <span className="landing-price-amount">$250</span>
                <span className="landing-price-type">/month</span>
              </div>
            </div>
            <p className="landing-price-card__desc">
              Live dashboard, continuous tracking, weekly coaching alerts. For traders who want ongoing improvement.
            </p>
            <ul className="landing-price-card__perks">
              <li>Everything in Pro tier</li>
              <li>Live dashboard access</li>
              <li>Slump prescription automation</li>
              <li>Weekly Margin of Safety reports</li>
              <li>Shadow Boxing simulator</li>
              <li>Loyalty rewards (FXReplay Pro at month 3)</li>
            </ul>
            <a href="/checkout/david" className="landing-btn landing-btn--secondary">
              Start Subscription
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER CTA - Final conversion point
          ============================================ */}
      <section className="landing-final">
        <h2>See what your emotions are costing you</h2>
        <p>Explore real trader data. No signup required.</p>
        <button className="landing-btn landing-btn--primary landing-btn--large" onClick={handleExploreDemo}>
          Explore Sample Data
        </button>
      </section>
    </div>
  )
}
