# Shibuya Analytics QA Plan

## Scope
- Marketing routes: `/`, `/pricing`, `/enterprise`, `/activate` plus Odoo deep links.
- Dashboard shell: `/dashboard`, `/dashboard/append`, `/dashboard/alerts`.
- Activation workflow + placeholder append trades parser.

## Test Matrix (excerpt)
| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Nav links | Click each nav entry | Router transitions without reload, CTA opens Odoo in new tab |
| 2 | Hero CTA | Click “Sounds good, I’m in” | Opens `ODOO_CHECKOUT_URLS.david` |
| 3 | Activation success | Submit email+order with mocked success | Toast shows success message + baseline instructions |
| 4 | Activation failure | Submit invalid order | Error banner displayed |
| 5 | Append trades preview | Paste sample + parse | Notes list renders row count + insights |
| 6 | Responsive layout | Resize to 375px width | Nav collapses gracefully, sections stack |
| 7 | Dashboard sidebar mobile | Visit dashboard <960px | Sidebar converts to stacked buttons |
| 8 | Build pipeline | `npm run build` | Passes without type errors |

## Automation Hooks
- **Unit**: Vitest (to add) for hooks + utilities.
- **Component**: React Testing Library snapshots for marketing hero + activation form.
- **E2E**: Playwright covering nav, activation, append flows.
- **CI**: GitHub Actions to run lint, test, build per PR.

## Edge Cases To Cover Later
1. Activation API unreachable → show retry + fallback email instructions.
2. Append textarea >50k rows → stream diff preview.
3. Odoo CTA links missing (env misconfig) → highlight in health check banner.
4. Query errors from analytics endpoints → degrade UI gracefully with skeleton + copy.
5. Browser offline while parsing trades → local warning.
