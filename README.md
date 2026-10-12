# Momentum Apps

Company site for [Momentum Apps Limited](https://momentum-apps.com). Static [Astro](https://astro.build) site, deployed on Cloudflare Pages, with a Pages Function for the contact form.

App names, platforms, status, links, and screenshots live in [`src/data/apps.ts`](src/data/apps.ts).

## Scripts

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # contact form validation
npm run build    # static site in dist/
npm run preview  # serve dist/
npm run brand    # rebuild favicon, app icons, and og.png from public/logo.png
```

## Contact form

`POST /api/contact` is a Cloudflare Pages Function ([`functions/api/contact.ts`](functions/api/contact.ts)). It:

- checks name (1–100), email, topic (`general`, `support`, `feedback`, `partnership`), and message (10–5,000)
- drops submissions that fill the hidden `hp_field` honeypot
- verifies a Cloudflare Turnstile token
- sends the message with [Resend](https://resend.com) to support@momentum-apps.com, with `reply_to` set to the visitor

The page submits with `fetch` and stays put: inline errors, a “Sending…” state, a success message, or an error with a `mailto:support@momentum-apps.com` link. Without JavaScript the form still posts and the function redirects to `/thanks.html` or `/form-error.html`.

### What you need to configure

Do this in the Cloudflare Pages project **before** the form can send mail. Nothing secret is stored in the repo.

1. **Turnstile.** In the Cloudflare dashboard, open Turnstile and create a widget for `momentum-apps.com`. Add the preview host (`*.pages.dev`) as well if you want the form to work on preview deployments. Copy the site key and the secret key.

2. **Pages environment variables.** In the Pages project, set these for Production and Preview:

   | Name | Where it is used |
   | --- | --- |
   | `TURNSTILE_SITE_KEY` | **Build.** It is written into the static HTML. Changing it requires a new build. |
   | `TURNSTILE_SECRET_KEY` | **Runtime.** The function uses it to verify tokens. |
   | `RESEND_API_KEY` | **Runtime.** The function uses it to send mail. |
   | `RESEND_FROM` | Optional runtime override. Default is `Momentum Apps <website@momentum-apps.com>`. |

   Mark the two secrets as encrypted. `TURNSTILE_SITE_KEY` is public, but it still has to be present when the site builds.

3. **Resend domain.** Add `momentum-apps.com` in Resend and publish the DNS records it gives you (SPF and DKIM) on the Cloudflare zone for that domain. Wait until Resend shows the domain as verified. The `from` address must be on that domain. Mail is delivered to `support@momentum-apps.com`.

4. **Pages build settings.**

   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: the repository root (so `functions/` is picked up)
   - Node.js version: 22 (`NODE_VERSION=22`)

   The `functions/` directory stays at the repo root. Cloudflare Pages deploys it beside the static output. Do not move it into `dist/`.

5. **Deploy a preview first.** Submit the form on the preview URL. You should get the message at support@momentum-apps.com, and reply should go to the address you typed.

For a local build of the widget, copy [`.env.example`](.env.example) to `.env` and set `TURNSTILE_SITE_KEY`. The secret and the Resend key are only read by the function at request time (`npx wrangler pages dev dist` if you want to exercise it locally).

## Logo

`public/logo.png` is the company mark (teal wave, black brush circle). Replace that file, then run `npm run brand` and commit the regenerated favicon, app icons, and `public/og.png`.

## Legacy URLs

These paths are unchanged so existing Play Store listings keep working. `npm run check:urls` asserts they exist in `dist/` after a build.

- `/` and `/contact.html`
- `/app-ads.txt`
- `/apps/habittracker/` plus `privacy.html`, `terms.html`, `help.html`, `news.html`
- `/apps/studymap/` plus `privacy.html`, `terms.html`, `help.html`
- `/apps/studymap-flashcards/` plus `privacy.html`, `terms.html`, `help.html`

StudyMap Study Planner is iOS and coming soon. It has no Google Play link. StoryLingua (story-lingua.com) is the featured app. VideoLingua and Momentum-Planner are not on this site.

Facebook: https://www.facebook.com/profile.php?id=61573096473546  
X: https://x.com/AppsMomentum
