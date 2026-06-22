export interface MethodProofMetric {
  label: string
  value: string
  detail: string
}

export interface MethodProofCard {
  eyebrow: string
  title: string
  body: string
  metrics: MethodProofMetric[]
}

export const METHOD_PROOF_CARDS: MethodProofCard[] = [
  {
    eyebrow: 'Shibuya Shield v2',
    title: 'Abuse surveillance is calibrated, not hand-waved.',
    body:
      'The v2 Shield engine replaces hand-authored risk weights with learned logistic weights, out-of-sample evaluation, hard negatives, and calibrated review bands.',
    metrics: [
      {
        label: 'ROC-AUC',
        value: '0.9788',
        detail: 'Out-of-sample synthetic stress set.',
      },
      {
        label: 'PR-AUC',
        value: '0.9753',
        detail: 'Average precision on the same held-out folds.',
      },
      {
        label: 'False-positive budget',
        value: '5%',
        detail: 'Operating point routes to human review, not auto-action.',
      },
    ],
  },
  {
    eyebrow: 'Risk v2',
    title: 'Ruin is first passage, not a static percentile.',
    body:
      'The ruin estimator simulates whether equity touches a max-loss floor before pass or timeout, using block bootstrap paths and explicit confidence limits.',
    metrics: [
      {
        label: 'Correlation',
        value: '0.7759',
        detail: 'Predicted vs realized ruin on synthetic ground truth.',
      },
      {
        label: 'MAE',
        value: '0.1647',
        detail: 'Finite-sample error is shown instead of hidden.',
      },
      {
        label: 'History gate',
        value: '80 trades',
        detail: 'Short samples can look safe even when the process is dangerous.',
      },
    ],
  },
  {
    eyebrow: 'Honesty layer',
    title: 'The limits are part of the product.',
    body:
      'Synthetic proof validates method behavior, not real-world accuracy. A serious Shibuya claim needs anonymized real trade books, labeled outcomes, and append proof.',
    metrics: [
      {
        label: 'Hard negatives',
        value: '15',
        detail: 'Legit-but-suspicious accounts are included on purpose.',
      },
      {
        label: 'Hard-negative FPR',
        value: '13.3%',
        detail: 'Suspicious clean accounts become review candidates, not verdicts.',
      },
      {
        label: 'Real proof',
        value: 'Pending',
        detail: 'Requires real labeled histories from traders, props, brokers, or audit partners.',
      },
    ],
  },
]

export const METHOD_PROOF_BOUNDARIES = [
  'The public story can explain the method, but cannot diagnose an account.',
  'The sample workspace can show the operating loop, but cannot claim persistence or live performance.',
  'The live workspace must attach payment, activation, upload, generated artifacts, and append history before private claims count.',
  'Firm-side abuse or risk claims require anonymized trade books and confirmed review labels before quoting real accuracy.',
]

