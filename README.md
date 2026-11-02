# Yojana Saathi — योजना साथी

An open-source agent that helps Indian citizens discover the government schemes they qualify for — and actually get them.

**Code for a Billion — Bharat Agentic-AI Hackathon 2026** · Track: Livelihood for the Uneducated (benefits access)

Live: https://yojana-saathi-osumn4hpl-piyush-sharmas-projects-1142533c.vercel.app/

## The problem
Crores of Indians miss benefits they are entitled to — PM-KISAN, Ayushman Bharat, scholarships, pensions — not because schemes don't exist, but because nobody tells them, in their language, what applies to them and what to do next.

## What it does
1. **Interview** — a 2-minute guided conversation (Hindi/English) builds your profile: age, state, occupation, income, land, category.
2. **Match** — a deterministic rules engine checks your profile against 44 verified schemes and tells you exactly *why* each one applies.
3. **Action plan** — per scheme: documents needed, where to apply, official link.
4. **Near-miss** — schemes you're one condition away from, so you know what would unlock them.
5. **Track** — save your plan and revisit it.

## Why not just ask ChatGPT?
ChatGPT answers questions. Yojana Saathi takes responsibility for an outcome:
- **Remembers** — your profile persists across sessions; it doesn't start over every time.
- **Rule-verified, not guessed** — matching is a deterministic engine over curated eligibility rules, not LLM hallucination. Every match shows its reason.
- **Closes the loop** — documents, offices, deadlines, follow-ups. Not just information.
- **Vernacular-first** — Hindi-first UI designed for the actual user base.

## Tech
- Static site, zero backend, zero API keys, works offline after first load.
- `data/schemes_batch*.json` — 44 schemes with bilingual names, benefits, eligibility rules, documents, apply steps, official source URLs.
- `js/matcher.js` — rules engine (eq/neq/in/not_in/gte/lte/gt/lt), returns matched + near-miss (one rule away).
- `js/i18n.js`, `js/app.js` — Hindi/English interview flow, results, saved plans (localStorage).

## Run locally
Open `index.html` in a browser, or serve the folder: `python3 -m http.server`.

## Data honesty
Eligibility criteria were verified against official `.gov.in` sources at build time. This is guidance — always confirm on the official portal before applying. Scheme data will drift; contributions welcome.

## License
MIT — built for Code for India, for anyone to adopt.
