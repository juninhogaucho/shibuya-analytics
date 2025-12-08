# Shibuya Analytics - MVP Launch Checklist

## ✅ DONE

- [x] Build passes (2115 modules)
- [x] StatsGrid redesigned as clean single-scroll section
- [x] Landing page with Hero, Stats, Methodology, How It Works, Dashboard Preview, FAQ
- [x] Pricing page with €99/€149 plans
- [x] Checkout page with CSV upload BEFORE payment
- [x] Success page after payment
- [x] Terms & Privacy pages
- [x] Waitlist popup component
- [x] Email sending via FormSubmit (sends CSV + order info to support@shibuya-analytics.com)
- [x] Stripe Payment Links integration (no backend needed!)

---

## 🔴 YOU NEED TO DO (5 minutes)

### 1. Create Stripe Payment Links

Go to: **https://dashboard.stripe.com/payment-links**

**For €99 Product:**
1. Click "New payment link"
2. Select product: "Shibuya Analytics Report" (€99)
3. After creation settings:
   - Under "After payment" → set to redirect to: `https://shibuya-analytics.com/checkout/success`
4. Copy the link (looks like `https://buy.stripe.com/xxx`)

**For €149 Product:**
1. Click "New payment link"  
2. Select product: "Shibuya Analytics Report Enhanced" (€149)
3. After creation settings:
   - Under "After payment" → set to redirect to: `https://shibuya-analytics.com/checkout/success`
4. Copy the link

### 2. Update Environment Variables

**In Vercel** (since you're deployed there):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these:

```
VITE_STRIPE_LINK_BASIC = https://buy.stripe.com/[your-99-link]
VITE_STRIPE_LINK_PREMIUM = https://buy.stripe.com/[your-149-link]
```

3. Redeploy (Vercel will auto-redeploy when you push to GitHub)

### 3. Activate FormSubmit Email

The first time someone submits the form, FormSubmit will send a confirmation email to `support@shibuya-analytics.com`. 
Click the link in that email to activate the form.

---

## 📋 FLOW SUMMARY

1. **Landing Page** → User browses, sees pricing
2. **Pricing Page** → User clicks "Get Started" on a plan
3. **Checkout Page** → User fills name, email, discord, referral + uploads CSV
4. **Submit** → CSV + info sent to support@shibuya-analytics.com via FormSubmit
5. **Stripe** → User redirected to Stripe Payment Link
6. **Success** → After payment, redirected to /checkout/success

**No backend needed. Everything is frontend + Stripe + email.**

---

## 🧹 OPTIONAL CLEANUP

These files are unused and can be deleted:
- `src/components/landing/Pricing.tsx`
- `src/pages/marketing/HomePage.tsx.backup`
- `src/pages/marketing/homepage2.html`
- `src/pages/marketing/CheckoutPage.tsx` (duplicate)
- `src/pages/marketing/ActivationPage.tsx`
- `src/pages/marketing/SolutionsPage.tsx`

---

## 🚀 QUICK DEPLOY

```bash
# Build locally
npm run build

# Push to GitHub (Vercel auto-deploys)
git add .
git commit -m "MVP ready"
git push
```

That's it! Once you add the Payment Links to Vercel env vars and redeploy, you're live.
