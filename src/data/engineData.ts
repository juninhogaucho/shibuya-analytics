/**
 * Engine data for the Shibuya Analytics engine showcase and explainer system.
 *
 * IP BALANCE:
 * - SHOW: Engine names, standard textbook formulas, institutional context, what we do for traders.
 *   These are all published mathematics with academic citations.
 * - DON'T SHOW: How we chain 68+ engines together, stacking logic, confidence weighting,
 *   proprietary feature engineering, calibration thresholds, combination methodology.
 */

export interface EngineEntry {
  id: string
  name: string
  shortName: string
  domain: string
  domainColor: string
  category: 'state' | 'attribution' | 'decay' | 'risk' | 'action' | 'trust'
  categoryLabel: string
  formula: string
  formulaExplain: string
  pitchLine: string
  whatItDoes: string
  whyThisMath: string
  institutional: string
  forYou: string
  realDepth: string
  vsOthers: string
  reference: string
}

export const ENGINE_CATEGORIES = {
  state: { label: "What's happening to me right now?", color: 'rgb(139, 92, 246)' },
  attribution: { label: 'Where is my money going?', color: 'rgb(59, 130, 246)' },
  decay: { label: 'Is my strategy still working?', color: 'rgb(245, 158, 11)' },
  risk: { label: 'How bad can it actually get?', color: 'rgb(244, 63, 94)' },
  action: { label: 'What should I do about it?', color: 'rgb(16, 185, 129)' },
  trust: { label: 'Can we trust these numbers?', color: 'rgb(148, 163, 184)' },
} as const

export const ENGINES: EngineEntry[] = [
  // ── STATE ─────────────────────────────────────────────
  {
    id: 'bql',
    name: 'Bayesian Hidden Markov Model',
    shortName: 'BQL',
    domain: 'Probabilistic Graphical Models',
    domainColor: 'rgb(139, 92, 246)',
    category: 'state',
    categoryLabel: "What's happening to me right now?",
    formula: 'P(s\u2091 | o\u2081\u2090\u209C) \u221D P(o\u209C | s\u2091) \u00D7 \u03A3 P(s\u2091 | s\u209C\u208B\u2081) \u00D7 P(s\u209C\u208B\u2081 | o\u2081\u2090\u209C\u208B\u2081)',
    formulaExplain: 'The forward algorithm: the probability of being in a given behavioral state RIGHT NOW equals the likelihood of your current trading patterns given that state, times the sum of all possible previous states weighted by how likely you were to transition into this one.',
    pitchLine: 'Detects your behavioral regime before your P&L shows it.',
    whatItDoes: 'Detects which behavioral state you are in right now \u2014 disciplined, hesitant, or tilted \u2014 from your trade patterns alone. No questionnaires. No self-reporting. The math reads your behavior the way a cardiologist reads an ECG.',
    whyThisMath: 'Rule-based systems are binary and backwards-looking: "if 3 losses in a row, flag tilt." By then the damage is done. BQL uses Bayesian inference to detect state transitions as they happen, catching problems before the P&L confirms them.',
    institutional: 'Goldman Sachs and Two Sigma use Hidden Markov Models for market regime detection \u2014 identifying whether a market is trending, ranging, or in crisis. We apply the exact same mathematical framework to detect YOUR behavioral regime.',
    forYou: 'When BQL says you are tilted at 72% probability, it means the statistical signature of your recent trades matches the pattern that historically precedes your worst sessions. That is not a guess. It is a measurement.',
    realDepth: 'Numerically stable log-space EM algorithm with logsumexp. Pre-computed log-emission matrices reused across E/M steps. Vectorized xi computation combining log-alpha, log-A, log-B, and log-beta in one tensor operation. Sticky-HMM extension with negative binomial state duration modeling for regime persistence. Production-grade validation: timestamp monotonicity, zero-variance detection, minimum sample constraints.',
    vsOthers: 'Typical tools use static rules ("3 losses = tilt") or simple moving averages. We run a full Baum-Welch EM algorithm with convergence guarantees, then extend it with sticky transitions and duration modeling. The difference is detecting tilt from behavioral signatures BEFORE the losses pile up.',
    reference: 'Rabiner, L.R. (1989). A tutorial on hidden Markov models. Proceedings of the IEEE, 77(2).',
  },
  {
    id: 'hddm',
    name: 'Hierarchical Drift-Diffusion Model',
    shortName: 'HDDM',
    domain: 'Computational Cognitive Science',
    domainColor: 'rgb(139, 92, 246)',
    category: 'state',
    categoryLabel: "What's happening to me right now?",
    formula: 'dx = v \u00B7 dt + s \u00B7 dW\n\nf(rt | v, a, t) = InvGauss(rt \u2212 t; \u03BC=a/v, \u03BB=a\u00B2)',
    formulaExplain: 'Every decision is modeled as noisy evidence accumulation between two boundaries. The drift rate v is your decision quality, the boundary separation a is your caution level, and the non-decision time t is your reaction speed. When v drops or a shrinks, your cognition is degrading.',
    pitchLine: 'Decomposes every trade decision into quality, caution, and speed.',
    whatItDoes: 'Breaks down every trade decision you make into three measurable cognitive components: how good your evidence processing is (drift rate), how cautious you are being (boundary separation), and how fast you react to signals (non-decision time). Then tracks these over time to detect cognitive degradation before it costs money.',
    whyThisMath: 'Self-reported confidence is unreliable. Your brain lies to you about how well you are making decisions. The drift-diffusion model measures decision quality from your actual behavior \u2014 the timing, the outcomes, the patterns \u2014 using the same framework cognitive neuroscientists use to study decision-making under uncertainty.',
    institutional: 'The Drift-Diffusion Model is the gold standard in cognitive neuroscience for modeling speeded decisions. Used by research labs at MIT, Princeton, and Oxford to study how the brain accumulates evidence. We are the first to apply it to trading decisions.',
    forYou: 'When your drift rate drops from 0.8 to 0.3 over a session, it means the quality of your decision-making has degraded measurably. You might feel fine. The math says otherwise. That is the signal to stop.',
    realDepth: 'Inverse Gaussian first-passage time distribution for correct boundary. Hierarchical extension via empirical Bayes: group-level priors from population MLE, individual estimates shrunk toward group mean via partial pooling with shrinkage weight w = n_i / (n_i + \u03BA). Cognitive degradation threshold at 1.5 sigma deviation from baseline.',
    vsOthers: 'No trading tool we are aware of decomposes decisions at the cognitive level. The closest alternative is journaling, which captures what you think happened, not what actually happened in your decision process.',
    reference: 'Ratcliff, R. (1978). A theory of memory retrieval. Psychological Review. Ratcliff, R. & McKoon, G. (2008). The diffusion decision model. Neural Computation.',
  },
  {
    id: 'quantum',
    name: 'Quantum Probability Interference',
    shortName: 'QCM',
    domain: 'Quantum Cognition Theory',
    domainColor: 'rgb(139, 92, 246)',
    category: 'state',
    categoryLabel: "What's happening to me right now?",
    formula: 'P(A) = P(A|B)P(B) + P(A|\u00ACB)P(\u00ACB)\n       + 2\u221A(P(A|B)P(B) \u00B7 P(A|\u00ACB)P(\u00ACB)) \u00B7 cos(\u03B8)',
    formulaExplain: 'Classical probability says the order of events should not matter. Traders violate this systematically: a win-then-loss sequence changes your risk appetite differently than loss-then-win. The interference angle \u03B8 measures exactly how far your decisions deviate from rational probability.',
    pitchLine: 'Measures cognitive distortion that classical probability cannot detect.',
    whatItDoes: 'Models your decisions as projections in Hilbert space to detect interference effects that classical statistics miss entirely. Measures order effects (win-then-loss vs loss-then-win changing your behavior asymmetrically), conjunction fallacy ("profitable AND consistent" feeling more likely than "profitable" alone), and the disjunction effect (behaving differently under uncertainty than under either known outcome).',
    whyThisMath: 'Classical probability assumes your decisions are commutative: P(A then B) = P(B then A). Decades of cognitive science research prove humans violate this under stress. Quantum probability models these violations mathematically instead of ignoring them.',
    institutional: 'Quantum cognition is an active research field at institutions including Indiana University, City University London, and the Max Planck Institute. Published in Proceedings of the Royal Society, Psychological Review, and Frontiers in Psychology.',
    forYou: 'When your interference angle \u03B8 is near zero, you are making roughly rational decisions. When |\u03B8| approaches \u03C0/2, your decision-making is maximally distorted by cognitive interference. This is not a personality assessment. It is a measurement of how much your recent sequence of outcomes is warping your next decision.',
    realDepth: 'State vectors in 2D Hilbert space. Decisions modeled as projection operators P_A, P_B. Sequential measurement: P(A then B) = ||P_B \u00B7 P_A |\u03C8>||\u00B2. Non-commutativity of projection operators produces interference. Interference angle estimated via MLE. Cognitive states classified: rational (\u03B8 \u2208 [0, 0.25]), mildly biased, distorted, highly irrational (\u03B8 \u2265 1.10).',
    vsOthers: 'No trading tool uses quantum probability theory. Most tools assume classical rationality or use simple heuristic labels. We measure the actual mathematical structure of cognitive distortion.',
    reference: 'Busemeyer, J.R. & Bruza, P.D. (2012). Quantum Models of Cognition and Decision. Cambridge University Press. Pothos, E.M. & Busemeyer, J.R. (2009). Proceedings of the Royal Society B, 276.',
  },

  // ── ATTRIBUTION ───────────────────────────────────────
  {
    id: 'dean',
    name: 'Robust PnL Attribution (Huber IRLS)',
    shortName: 'DEAN',
    domain: 'Robust Econometrics',
    domainColor: 'rgb(59, 130, 246)',
    category: 'attribution',
    categoryLabel: 'Where is my money going?',
    formula: '\u03C1(u) = \u00BD u\u00B2  if |u| \u2264 c\n\u03C1(u) = c|u| \u2212 \u00BD c\u00B2  if |u| > c\n\nscale = median(|r \u2212 median(r)|) / 0.6745',
    formulaExplain: 'Huber loss downweights outliers that would corrupt ordinary regression. The MAD-based scale estimator is resistant to the very extreme trades that need explaining most. The result: a decomposition of every dollar that does not let one blowup trade distort the entire picture.',
    pitchLine: 'Decomposes every dollar into market, behavior, execution, and timing.',
    whatItDoes: 'Takes your P&L and mathematically separates it into four components: how much came from market conditions (you were in the right place), how much came from your behavior (revenge trades, oversizing, FOMO entries), how much came from execution quality (slippage, timing), and how much came from timing (entering too late, exiting too early).',
    whyThisMath: 'Ordinary regression treats all data points equally. One blowup trade would distort the entire attribution. Huber IRLS iteratively downweights extreme observations using a robust scale estimator (MAD), so the attribution reflects your typical behavior, not just your worst day.',
    institutional: 'Huber robust regression is standard in financial econometrics when data contains outliers. Used by risk desks to decompose portfolio returns when a single position can dominate the result.',
    forYou: 'When DEAN says "your behavior cost you \u20AC892 this month," that is not a guess or a rule of thumb. It is a statistically robust decomposition that handled every outlier trade properly. The number means: if you had traded with your baseline discipline, you would have \u20AC892 more.',
    realDepth: 'Iteratively Reweighted Least Squares with Huber loss function. MAD-based robust scale estimation (division by 0.6745 for Gaussian consistency). Ridge regularization with intercept distinction (proper Tikhonov penalty). Interaction term selection with feature importance ranking. Permutation importance for attribution (not just coefficients). Canonical group mapping preventing frontend/backend schema drift.',
    vsOthers: 'Typical tools show "you lost $X on these trades." We decompose WHY: how much was market, how much was your decisions, and which specific behavioral patterns caused the most damage. With confidence intervals.',
    reference: 'Huber, P.J. (1964). Robust estimation of a location parameter. Annals of Mathematical Statistics, 35(1).',
  },
  {
    id: 'counterfactual',
    name: 'Structural Counterfactual Engine',
    shortName: 'SCE',
    domain: 'Causal Inference (Pearl)',
    domainColor: 'rgb(59, 130, 246)',
    category: 'attribution',
    categoryLabel: 'Where is my money going?',
    formula: 'P(Y_x | obs) via do-calculus\n\nOpportunity Cost = E[PnL | do(follow warning)] \u2212 Actual PnL',
    formulaExplain: 'Pearl\u2019s do-calculus lets us compute what WOULD have happened under a different decision, not just what DID happen. The opportunity cost is the difference between the counterfactual outcome and reality.',
    pitchLine: 'Shows exactly what following our warnings would have saved you.',
    whatItDoes: 'Runs Monte Carlo simulations of alternative histories: "You lost \u20AC1,200 today. If you had followed our BQL warning to stop trading, you would be UP \u20AC800. Opportunity cost: \u20AC2,000." This is not hypothetical hand-waving. It is a statistically grounded counterfactual with confidence intervals.',
    whyThisMath: 'Telling someone "you should have stopped" is vague. Computing the counterfactual outcome with confidence intervals makes the cost of ignoring the signal concrete and measurable.',
    institutional: 'Structural causal models (Pearl 2009) are the foundation of modern causal inference in economics, epidemiology, and social science. We apply them to trading decisions.',
    forYou: 'Every time you ignore a Shibuya signal, we compute what would have happened if you had listened. Over time, this builds an undeniable record of how much money the system would have saved you.',
    realDepth: 'Monte Carlo counterfactual simulation with 1000+ replications. Policy evaluation framework comparing actual vs hypothetical outcomes. Personalized treatment effects per trader. Confidence intervals on opportunity cost estimates.',
    vsOthers: 'No trading tool we know computes structural counterfactuals. Most tools show past performance. We show the cost of every ignored signal.',
    reference: 'Pearl, J. (2009). Causality: Models, Reasoning, and Inference. Cambridge University Press.',
  },

  // ── DECAY ─────────────────────────────────────────────
  {
    id: 'afma',
    name: 'Adaptive Feature Market Aligner',
    shortName: 'AFMA',
    domain: 'Statistical Process Control',
    domainColor: 'rgb(245, 158, 11)',
    category: 'decay',
    categoryLabel: 'Is my strategy still working?',
    formula: 'PSI = \u03A3(p_base \u2212 p_curr) \u00D7 log(p_base / p_curr)\nMMD = (1/m\u00B2)\u03A3k(x,x\u2032) + (1/n\u00B2)\u03A3k(y,y\u2032) \u2212 (2/mn)\u03A3k(x,y)\nW = \u222B|F_base(x) \u2212 F_curr(x)|dx  (normalized by \u03C3)\nKS = sup|F_base(x) \u2212 F_curr(x)|',
    formulaExplain: 'Four independent drift metrics running simultaneously. PSI checks if the distribution shape has changed. MMD uses kernel methods to detect non-linear distributional shifts. Wasserstein measures how much probability mass has moved (normalized for cross-symbol comparison). KS finds the maximum deviation between cumulative distributions. Each gets its own bootstrap confidence interval.',
    pitchLine: 'Detects strategy decay weeks before your P&L shows it.',
    whatItDoes: 'Monitors every feature of every strategy you trade and runs four independent statistical tests to detect when something has changed. Not just "is my win rate dropping?" but "has the distributional character of my entries shifted, has the predictive relationship between my signals and outcomes weakened, and did the feature drift precede the P&L drop (causal direction)?"',
    whyThisMath: 'A single statistical test can miss drift that another catches. PSI is sensitive to bin-level changes, KS to maximum deviation, Wasserstein to total mass movement, MMD to non-linear distributional shifts. Running all four with independent confidence intervals means drift cannot hide.',
    institutional: 'Population Stability Index is standard in credit risk modeling (Basel requirements). MMD is used in domain adaptation research at Google Brain and DeepMind. Wasserstein distance is foundational in optimal transport theory (Fields Medal, C\u00E9dric Villani).',
    forYou: 'When AFMA flags your Nifty opening drive setup with 0.87 confidence, it means four independent statistical tests agree the market has changed under that strategy. The setup that made you money last quarter is no longer the same statistical object. Stop trading it until the data changes.',
    realDepth: 'PSI with dynamic quantile binning for stability. Wasserstein normalized by combined std for scale-invariant cross-symbol comparison. MMD with RBF kernel using median heuristic bandwidth, subsampled to prevent O(n\u00B2) memory. Block bootstrap CIs on PSI and Wasserstein (200 iterations). Mutual information with paired NaN dropping. 500-permutation p-values for correlation significance. Rolling window predictive power tracking. Lead/lag causal hinting (does feature drift precede PnL drop?). SHA-256 provenance hashing on every report. Ranked feature recommendations with confidence scoring.',
    vsOthers: 'Typical tools check one metric (usually just win rate). We run four mathematically independent drift metrics simultaneously, each with its own confidence interval, plus predictive power tracking with permutation significance, plus causal direction hinting. The difference is catching decay 2\u20133 weeks earlier.',
    reference: 'Gretton, A. et al. (2012). A kernel two-sample test. JMLR. Villani, C. (2003). Topics in Optimal Transport.',
  },
  {
    id: 'lyapunov',
    name: 'Maximal Lyapunov Exponent',
    shortName: 'MLE',
    domain: 'Nonlinear Dynamics / Chaos Theory',
    domainColor: 'rgb(245, 158, 11)',
    category: 'decay',
    categoryLabel: 'Is my strategy still working?',
    formula: 'y(i) = [x(i), x(i+\u03C4), ..., x(i+(m\u22121)\u03C4)]\n\n\u03BB = lim (1/k) \u00B7 ln(d(i,j,k) / d(i,j,0))\n\nPredictability horizon \u2248 1 / \u03BB',
    formulaExplain: 'We embed your equity curve into phase space using Takens\u2019 theorem, then measure how fast nearby trajectories diverge. A positive Lyapunov exponent means your returns are chaotic (limited predictability). A negative one means they are deterministic. The predictability horizon tells you exactly how far ahead your edge extends.',
    pitchLine: 'Tells you exactly how far ahead your predictions are trustworthy.',
    whatItDoes: 'Measures whether your trading results are chaotic (unpredictable) or deterministic (forecastable) using nonlinear dynamics. Then computes your predictability horizon: the number of trades or sessions ahead where your edge still holds before chaos takes over.',
    whyThisMath: 'Most traders assume their edge is stable. Lyapunov analysis reveals whether the underlying dynamics are chaotic or deterministic. If your equity curve is chaotic, no amount of pattern recognition will help beyond the predictability horizon. You need to know this.',
    institutional: 'Lyapunov exponents are used in physics, meteorology (weather prediction limits), and quantitative finance for regime detection. The mathematical framework originates from Rosenstein (1993) for small data sets.',
    forYou: 'If your Lyapunov exponent is positive with a predictability horizon of 5 trades, it means the patterns in your equity curve become unreliable after 5 trades. Planning a 50-trade strategy on the same assumptions is mathematically doomed.',
    realDepth: 'Rosenstein\u2019s method for small data sets. Takens\u2019 embedding theorem for phase space reconstruction. Auto-detected embedding dimension via False Nearest Neighbors (FNN threshold < 10%). Auto-detected time delay via Average Mutual Information (first local minimum). Theiler window exclusion to prevent temporal autocorrelation artifacts. Divergence tracking via linear regression on log-divergence curves.',
    vsOthers: 'No retail trading tool computes Lyapunov exponents. The concept of a predictability horizon does not exist in any competing product.',
    reference: 'Rosenstein, M.T. et al. (1993). A practical method for calculating largest Lyapunov exponents from small data sets. Physica D.',
  },

  // ── RISK ──────────────────────────────────────────────
  {
    id: 'evt',
    name: 'Extreme Value Theory (GPD-MLE)',
    shortName: 'EVT',
    domain: 'Tail Risk Modeling',
    domainColor: 'rgb(244, 63, 94)',
    category: 'risk',
    categoryLabel: 'How bad can it actually get?',
    formula: 'F(x) = 1 \u2212 (1 + \u03BEx/\u03C3)^(\u22121/\u03BE)\n\nVaR_\u03B1 = u + (\u03C3/\u03BE)[((n/N_u)(1\u2212\u03B1))^(\u2212\u03BE) \u2212 1]\nES_\u03B1 = VaR_\u03B1/(1\u2212\u03BE) + (\u03C3 \u2212 \u03BEu)/(1\u2212\u03BE)',
    formulaExplain: 'The Generalized Pareto Distribution models the tail of your loss distribution \u2014 not the average loss, the catastrophic one. VaR tells you "there is a 1% chance of losing more than X." Expected Shortfall tells you "when that 1% event happens, the average loss is Y." Both computed with proper confidence intervals.',
    pitchLine: 'Basel III requires this for bank capital adequacy. We run it on your account.',
    whatItDoes: 'Calculates your real tail risk \u2014 the probability and expected size of catastrophic losses \u2014 using the same mathematics that regulators require banks to use for capital adequacy. Not average drawdown. Not max historical loss. The statistically predicted worst case at 95%, 99%, and 99.9% confidence.',
    whyThisMath: 'Normal distributions underestimate tail risk by orders of magnitude. Your worst loss is not "3 standard deviations." EVT models the actual tail shape using the Generalized Pareto Distribution, which captures the fat tails that destroy trading accounts.',
    institutional: 'Basel III capital requirements mandate EVT for bank risk modeling. Every major bank risk desk runs GPD-MLE. This is not optional for institutions managing real money.',
    forYou: 'When EVT says your 99.9% VaR is \u20AC4,200, it means: once in a thousand sessions, you can expect to lose at least \u20AC4,200. That is the number your position sizing should respect. Everything else is wishful thinking.',
    realDepth: 'GPD fit via Maximum Likelihood Estimation with Newton-Raphson optimization (not method-of-moments, which is less efficient). Fisher Information matrix for parameter standard errors. Profile likelihood for optimal threshold selection. Delta method confidence intervals on VaR and Expected Shortfall. Tail index \u03BE interpretation: \u03BE > 0.5 implies infinite variance. Return level estimation for 1-in-100 and 1-in-1000 events.',
    vsOthers: 'Typical tools show "max drawdown was X%" from historical data. We compute the statistically predicted tail risk with confidence intervals. The difference: history shows what DID happen. EVT predicts what CAN happen.',
    reference: 'McNeil, A.J. & Frey, R. (2000). Estimation of tail-related risk measures for heteroscedastic financial time series. Journal of Empirical Finance.',
  },
  {
    id: 'cox',
    name: 'Cox Proportional Hazards',
    shortName: 'Cox PH',
    domain: 'Survival Analysis',
    domainColor: 'rgb(244, 63, 94)',
    category: 'risk',
    categoryLabel: 'How bad can it actually get?',
    formula: 'h(t|X) = h\u2080(t) \u00D7 exp(\u03B2 \u00B7 X)\n\nS(t|X) = S\u2080(t)^{exp(\u03B2\u00B7X)}',
    formulaExplain: 'The hazard function h(t) is the instantaneous risk of account breach at time t, given your behavioral covariates X. The survival function S(t) is the probability your account is still alive at time t. Both are personalized to YOUR specific trading behavior.',
    pitchLine: 'Predicts time-to-breach. Not "you might blow up" \u2014 "12 sessions at current behavior."',
    whatItDoes: 'Survival analysis for your trading account. Predicts how many sessions until your account breaches at your current behavioral trajectory. Computes hazard ratios: how much each behavioral factor (loss streaks, drawdown speed, trade frequency, leverage) increases your breach probability.',
    whyThisMath: 'Saying "you are at risk" is vague. Cox regression gives a specific, personalized timeline with specific factors ranked by impact. It answers: "which behavior change would buy you the most time?"',
    institutional: 'Cox regression is the standard survival model in clinical trials (drug efficacy), actuarial science (insurance pricing), and reliability engineering (failure prediction). We apply it to account survival.',
    forYou: 'When Cox says "breach probability reaches 50% in 12 trading sessions," that is a personalized prediction based on your loss streak length, max drawdown velocity, trade frequency, time since rest, and current leverage. It also tells you which factor to change first.',
    realDepth: 'Partial likelihood estimation (no parametric baseline hazard assumption). Breslow estimator for baseline hazard. Newton-Raphson optimization with step-size control. Concordance C-index for discrimination quality. Hazard ratios with confidence intervals. Median survival time via binary search on survival curve. Covariates: avg_loss_streak, max_drawdown_pct, trade_frequency, time_since_rest, leverage.',
    vsOthers: 'No trading tool predicts time-to-breach with survival analysis. Typical tools show "your drawdown is X%" which is backward-looking. We predict how many sessions you have left.',
    reference: 'Cox, D.R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society, Series B.',
  },
  {
    id: 'copula',
    name: 'Copula Tail Dependence',
    shortName: 'Copula',
    domain: 'Dependence Modeling',
    domainColor: 'rgb(244, 63, 94)',
    category: 'risk',
    categoryLabel: 'How bad can it actually get?',
    formula: 'F(x\u2081,...,x\u2099) = C(F\u2081(x\u2081),...,F\u2099(x\u2099))\n\n\u03BB_L = lim P(U\u2082 \u2264 u | U\u2081 \u2264 u) as u\u21920\n\u03BB_U = lim P(U\u2082 > u | U\u2081 > u) as u\u21921',
    formulaExplain: 'Sklar\u2019s theorem: any joint distribution separates into marginals and a copula that captures the dependence structure. \u03BB_L is the lower tail dependence: how likely your positions are to crash TOGETHER. \u03BB_U is the upper tail dependence. Correlation says nothing about this. Copulas do.',
    pitchLine: 'Measures how your positions blow up together when it matters most.',
    whatItDoes: 'Models how your positions co-move in extreme conditions. Markets are MORE correlated in crashes than in rallies. Linear correlation completely misses this. Copulas capture the tail dependence that destroys diversification exactly when you need it most.',
    whyThisMath: 'A 0.3 correlation between two positions means nothing about what happens in a crash. Clayton copulas model lower tail dependence: the probability that BOTH positions crash simultaneously. This is the number that matters for survival.',
    institutional: 'Copula models are standard in bank credit risk (Basel II/III), insurance (aggregate loss modeling), and multi-asset portfolio management. Five copula families capture different dependence structures.',
    forYou: 'When the Clayton copula shows \u03BB_L = 0.4 between your Nifty and BankNifty positions, it means there is a 40% probability that when one position hits its extreme loss, the other does too. Your "diversification" is an illusion in the tail.',
    realDepth: 'Five copula families: Gaussian (no tail dependence), Student-t (symmetric tail dependence), Clayton (lower tail / crashes), Gumbel (upper tail), Frank (symmetric). MLE parameter estimation with Fisher Information standard errors. AIC/BIC model selection. Tail dependence coefficients \u03BB_L and \u03BB_U. Kendall\u2019s tau derivation from copula parameters.',
    vsOthers: 'No retail trading tool models tail dependence. Most show correlation, which is a linear measure that says nothing about crashes. The difference is life or death for your account in extreme conditions.',
    reference: 'Sklar, A. (1959). Fonctions de r\u00E9partition \u00E0 n dimensions et leurs marges. Joe, H. (1997). Multivariate Models and Dependence Concepts.',
  },

  // ── ACTION ────────────────────────────────────────────
  {
    id: 'dml',
    name: 'Double Machine Learning',
    shortName: 'DML',
    domain: 'Causal Inference',
    domainColor: 'rgb(16, 185, 129)',
    category: 'action',
    categoryLabel: 'What should I do about it?',
    formula: 'Y = \u03B8\u00B7D + g(X) + \u03B5\nD = m(X) + V\n\n\u03B8\u0302 = (\u1E0C\u0303\u2032\u1E0C\u0303)\u207B\u00B9 \u1E0C\u0303\u2032\u1EF8\u0303',
    formulaExplain: '\u03B8 is the causal effect of a behavioral change D on your P&L outcome Y, after removing all confounding via flexible ML models g(X) and m(X). Cross-fitting eliminates regularization bias. The estimate \u03B8 comes with honest confidence intervals via Neyman orthogonality.',
    pitchLine: 'Proves which behavioral changes CAUSE P&L improvement.',
    whatItDoes: 'Does not just correlate behavior with outcomes. Uses Chernozhukov\u2019s Double Machine Learning to prove which specific behavioral changes CAUSE P&L improvement, with confidence intervals that hold up to academic peer review. The difference between "traders who hold longer tend to profit more" (correlation) and "if YOU increase your hold time by 10 minutes, your expected PnL improves by \u20AC23 per trade" (causation).',
    whyThisMath: 'Naive regression confuses correlation with causation. Maybe traders who hold longer are just better traders (confounding). DML removes all confounding via flexible ML models, then estimates the pure causal effect using cross-fitting to eliminate bias.',
    institutional: 'Double Machine Learning was developed by Victor Chernozhukov at MIT and published in The Econometrics Journal (2018). It is the state-of-the-art for causal inference in high-dimensional settings, used by tech companies and central banks.',
    forYou: 'When DML says "reducing your average trade frequency by 2 trades per day would improve your monthly PnL by \u20AC340 with 95% CI [\u20AC180, \u20AC500]," that is a causal claim, not a correlation. It means: if you actually make this change, holding everything else constant, this is the predicted effect.',
    realDepth: 'Partially linear model with cross-fitting (K-fold). Nuisance functions g(X) and m(X) estimated via Ridge regression and gradient boosted stumps (depth-1 trees). Cross-fitted residuals: \u1EF8 = Y \u2212 \u011D(X), \u1E0C\u0303 = D \u2212 m\u0302(X). OLS on residuals for debiased \u03B8 estimate. Neyman orthogonality ensures honest confidence intervals via Riesz representation. Standard errors, p-values, and practical significance assessment.',
    vsOthers: 'No trading tool provides causal inference. All competitors show correlations. We prove causation with confidence intervals. The difference is knowing what to change vs. guessing.',
    reference: 'Chernozhukov, V. et al. (2018). Double/debiased machine learning for treatment and structural parameters. The Econometrics Journal.',
  },
  {
    id: 'snell',
    name: 'Snell Envelope (Optimal Stopping)',
    shortName: 'Snell',
    domain: 'Optimal Stopping Theory',
    domainColor: 'rgb(16, 185, 129)',
    category: 'action',
    categoryLabel: 'What should I do about it?',
    formula: 'U_N = Z_N\nU_n = max(Z_n, E[U_{n+1} | F_n])\n\n\u03C4* = inf{n \u2265 0 : U_n = Z_n}',
    formulaExplain: 'The Snell envelope is the smallest supermartingale dominating the payoff process. Backward induction computes the optimal moment to stop: intervene when the envelope touches the payoff, because waiting has zero marginal value. This is the same math used to price American options.',
    pitchLine: 'Computes the mathematically optimal moment to intervene.',
    whatItDoes: 'Does not guess when to tell you to stop trading. Solves the optimal stopping problem exactly: given your current drawdown velocity, BQL distress score, hold-time compression, and loss streak, computes whether intervening NOW is better than waiting. The gap between the envelope and the payoff measures the "option value of waiting."',
    whyThisMath: 'Intervening too early wastes good trading time. Intervening too late costs money. The Snell envelope finds the mathematically exact boundary between these two errors.',
    institutional: 'Optimal stopping theory (Snell 1952, Shiryaev 1978) is the mathematical foundation for American option pricing on Wall Street. Every investment bank runs backward induction for early exercise decisions. We apply it to the question: when should this trader stop?',
    forYou: 'When the Snell envelope says "intervene now," it means the expected cost of waiting exceeds the benefit. The option value of continuing to trade is zero. This is not a feeling or a rule of thumb. It is a mathematical proof.',
    realDepth: 'Backward induction over discretized BQL risk states (low/medium/high/critical). Markov transition kernel estimated from historical BQL state-to-state transitions with Dirichlet(\u03B1=1) smoothing. Payoff function: weighted combination of drawdown velocity, BQL distress, hold-time compression, loss streak. Bootstrap CIs (B=200) via resampled transition kernels.',
    vsOthers: 'Competing tools use fixed rules ("stop after 3 losses") or simple thresholds. We solve the optimal stopping problem dynamically based on your current state and transition probabilities.',
    reference: 'Snell, J.L. (1952). Applications of martingale system theorems. Trans. Amer. Math. Soc. Peskir, G. & Shiryaev, A. (2006). Optimal Stopping and Free-Boundary Problems.',
  },
  {
    id: 'kelly',
    name: 'Kelly Criterion (Behavioral)',
    shortName: 'Kelly',
    domain: 'Portfolio Theory',
    domainColor: 'rgb(16, 185, 129)',
    category: 'action',
    categoryLabel: 'What should I do about it?',
    formula: 'f* = (p \u00B7 b \u2212 q) / b\n\nwhere p = win rate, q = 1\u2212p, b = avg_win / avg_loss\n\nBehavioral Kelly = f* \u00D7 \u03B1(BQL_state, drawdown)',
    formulaExplain: 'The Kelly criterion maximizes long-term geometric growth. But the standard formula assumes rational execution. Our behavioral Kelly adjusts for your current psychological state: if BQL detects tilt, the Kelly fraction shrinks. If your drawdown is elevated, it shrinks further. The math respects your humanity.',
    pitchLine: 'Optimal sizing adjusted for your psychology, not just your stats.',
    whatItDoes: 'Calculates the optimal position size for maximum long-term growth, then adjusts it based on your current behavioral state. If you are tilted, the Kelly fraction drops. If you are in drawdown, it drops further. The result is a position size that is mathematically optimal for someone with YOUR psychology in YOUR current state.',
    whyThisMath: 'Standard Kelly assumes perfectly rational execution. Traders are not rational. Behavioral Kelly bridges the gap between optimal theory and real human behavior.',
    institutional: 'Kelly criterion is used by professional gamblers, quantitative hedge funds (Ed Thorp, Renaissance Technologies), and portfolio managers. We add the behavioral adjustment that even institutional desks lack.',
    forYou: 'When Kelly says "risk 1.2% per trade right now" instead of your default 2%, it is because your BQL state is elevated and the math shows that your current behavior pattern historically leads to oversized losses. The smaller size protects you from yourself.',
    realDepth: 'Standard Kelly with win rate and payoff ratio. Half-Kelly option for conservative sizing. Behavioral adjustment factor \u03B1 computed from BQL state probability and current drawdown percentage. Speedometer gauge visualization with zones: reckless, aggressive, slightly high, optimal, conservative, under-sized.',
    vsOthers: 'Some tools compute basic Kelly. None adjust for behavioral state. The behavioral adjustment is the difference between optimal sizing for a robot and optimal sizing for you.',
    reference: 'Kelly, J.L. (1956). A new interpretation of information rate. Bell System Technical Journal. Thorp, E.O. (2006). The Kelly criterion in blackjack, sports betting, and the stock market.',
  },

  // ── TRUST ─────────────────────────────────────────────
  {
    id: 'bootstrap',
    name: 'BCa Bootstrap Confidence Intervals',
    shortName: 'BCa',
    domain: 'Statistical Inference',
    domainColor: 'rgb(148, 163, 184)',
    category: 'trust',
    categoryLabel: 'Can we trust these numbers?',
    formula: '\u03B1\u2081 = \u03A6(z\u2080 + (z\u2080 + z_\u03B1) / (1 \u2212 a(z\u2080 + z_\u03B1)))\n\nz\u2080 = \u03A6\u207B\u00B9(proportion of \u03B8\u0302* < \u03B8\u0302)\na = (1/6) \u00D7 \u03A3(\u03B8\u0302_{\u2212i} \u2212 \u03B8\u0302_{(\u00B7)})\u00B3 / (\u03A3(...))\u00B2)^{3/2}',
    formulaExplain: 'The Bias-Corrected and Accelerated bootstrap adjusts for both bias (z\u2080, estimated from bootstrap distribution) and skewness (acceleration a, estimated via jackknife). This gives much better confidence interval coverage than simple percentile bootstrap, especially for small samples and skewed distributions like trading returns.',
    pitchLine: 'Confidence intervals on everything. Not just a number \u2014 a range you can trust.',
    whatItDoes: 'Every number Shibuya shows you comes with a confidence interval computed via institutional-grade bootstrap methods. Not just "your Sharpe is 1.2" but "your Sharpe is 1.2 [0.7, 1.8] at 95% confidence." This means you know how much to trust every single metric.',
    whyThisMath: 'A number without a confidence interval is a guess. Trading returns are skewed and fat-tailed, so simple percentile bootstrap gives poor coverage. BCa corrects for both bias and skewness, giving you reliable intervals even on small, non-normal datasets.',
    institutional: 'BCa bootstrap (Efron & Tibshirani 1993) is the gold standard for confidence intervals in applied statistics. Used across all quantitative sciences when closed-form intervals are not available.',
    forYou: 'When Shibuya says "your discipline tax is \u20AC847 [\u20AC620, \u20AC1,100]," you know the true cost is almost certainly in that range. If someone else gives you a single number with no interval, ask them how much they trust it.',
    realDepth: 'BCa with jackknife-estimated acceleration parameter. Plus: Studentized bootstrap for better small-sample coverage. Block bootstrap for time-series data with autocorrelation. Stationary bootstrap with random block lengths. All four methods available depending on data characteristics.',
    vsOthers: 'No competitor shows confidence intervals. Every number they display is a point estimate with no measure of reliability. We show you how much to trust every metric.',
    reference: 'Efron, B. & Tibshirani, R. (1993). An Introduction to the Bootstrap. Chapman & Hall.',
  },
  {
    id: 'rmt',
    name: 'Random Matrix Theory Filter',
    shortName: 'RMT',
    domain: 'Spectral Analysis',
    domainColor: 'rgb(148, 163, 184)',
    category: 'trust',
    categoryLabel: 'Can we trust these numbers?',
    formula: '\u03BB\u00B1 = (1 \u00B1 \u221A(N/T))\u00B2\n\nC_clean = V_signal \u039B_signal V_signal\u1D40 + \u03BB\u0304_noise I',
    formulaExplain: 'The Marchenko-Pastur distribution gives the theoretical bounds on eigenvalues of a pure noise correlation matrix. Any eigenvalue above \u03BB+ represents genuine signal. The cleaned matrix replaces noise eigenvalues with their average, preserving total variance while removing spurious correlations.',
    pitchLine: 'Separates real patterns from statistical noise in your data.',
    whatItDoes: 'When analyzing correlations across many traders or many strategies, most apparent patterns are pure noise. RMT identifies which eigenvalues of the correlation matrix exceed the theoretical noise floor and reconstructs a "cleaned" matrix containing only genuine signal.',
    whyThisMath: 'Sample correlation matrices are notorious for containing spurious patterns, especially when the number of variables is large relative to the number of observations. RMT provides a principled cutoff: anything below the Marchenko-Pastur bound is noise.',
    institutional: 'Originated in nuclear physics (Wigner 1955), applied to finance by Laloux, Cizeau, Bouchaud & Potters (1999) at Capital Fund Management. Now standard in quantitative portfolio construction.',
    forYou: 'When we tell you two of your strategies are correlated, it has survived the RMT filter. The correlation is real, not a statistical artifact. When a pattern does not survive the filter, we do not show it to you.',
    realDepth: 'Marchenko-Pastur eigenvalue bounds. Eigendecomposition of sample correlation matrix. Signal/noise separation at \u03BB+ threshold. Noise eigenvalue replacement with trace-preserving average. Cleaned matrix reconstruction via signal eigenvectors.',
    vsOthers: 'No retail trading tool applies Random Matrix Theory. Most tools show raw correlations without any noise filtering, leading to spurious pattern detection.',
    reference: 'Laloux, L. et al. (1999). Noise dressing of financial correlation matrices. Physical Review Letters, 83(7).',
  },
  {
    id: 'transfer_entropy',
    name: 'Transfer Entropy',
    shortName: 'TE',
    domain: 'Information Theory',
    domainColor: 'rgb(148, 163, 184)',
    category: 'trust',
    categoryLabel: 'Can we trust these numbers?',
    formula: 'T_{X\u2192Y} = H(Y_t | Y_{t-1:t-L}) \u2212 H(Y_t | Y_{t-1:t-L}, X_{t-1:t-L})',
    formulaExplain: 'Transfer entropy measures directed information flow. How much does knowing X\u2019s past reduce uncertainty about Y\u2019s future? Significance tested via 1000-surrogate permutation: shuffle X, recompute TE, see if the observed value is extreme.',
    pitchLine: 'Detects who is copying whom, at what lag, with statistical significance.',
    whatItDoes: 'Measures directed information transfer between time series. In the trading context: detects if one trader\u2019s actions predict another\u2019s (copy trading detection), or if one instrument\u2019s movement predicts another (lead-lag relationships). With exact lag identification and statistical significance testing.',
    whyThisMath: 'Correlation is symmetric and does not capture direction. Transfer entropy is asymmetric: it tells you WHO influences WHOM and by how much. Plus it captures non-linear dependencies that correlation misses.',
    institutional: 'Transfer entropy (Schreiber 2000) is used in neuroscience (brain connectivity), climate science (teleconnection patterns), and financial network analysis. Published in Physical Review Letters.',
    forYou: 'If your trading pattern shows significant transfer entropy from a specific news source or another trader, it means your decisions are being influenced by that source with a measurable lag. Knowing this lets you decide whether that influence is helpful or harmful.',
    realDepth: 'Conditional Shannon entropy via histogram estimator. Quintile discretization of continuous series. Optimal lag detection across lags 1\u201310. 1000-surrogate permutation significance testing. Bidirectional measurement: T_{X\u2192Y} and T_{Y\u2192X}. Net flow and direction classification.',
    vsOthers: 'No trading tool measures directed information flow. Correlation-based tools cannot detect direction of influence.',
    reference: 'Schreiber, T. (2000). Measuring information transfer. Physical Review Letters, 85(2).',
  },
]

export const SHOWCASE_ENGINES = ENGINES.filter(e =>
  ['bql', 'dean', 'afma', 'evt', 'dml', 'lyapunov', 'quantum', 'hddm', 'snell', 'cox', 'copula', 'bootstrap'].includes(e.id)
)

export function getEngineById(id: string): EngineEntry | undefined {
  return ENGINES.find(e => e.id === id)
}

export function getEnginesByCategory(category: EngineEntry['category']): EngineEntry[] {
  return ENGINES.filter(e => e.category === category)
}
