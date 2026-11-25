# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

A new car owner in the Philippines, standing at a casa (dealer service) counter, holding the PMS quote the service advisor just handed them. The advisor is waiting; the owner has a phone in one hand and seconds to answer. Most have never seen their car's manufacturer maintenance schedule and learn it from the quote itself. Required service and optional add-ons arrive on the same sheet, in the same tone, so they cannot tell which is which.

Their job: decide, line by line and on the spot, what to approve, what to question, and what to decline, then say it to the advisor without an argument.

## Product Purpose

PMS Check tells the owner, for every line on a casa quote, what their car's manufacturer schedule requires at this visit. Every line gets one of three verdicts, each with a reason and a source:

- **Say yes**: in the car's schedule for this service.
- **Ask first**: reasonable but not due yet, or not certain. The owner decides at the counter.
- **Say no**: a known upsell, matched with certainty, not in the car's own schedule.

The core loop: know the car and the visit (model, variant, year, transmission, delivery month, odometer, which service point) → get the quote in (scan, choose a photo, or type the lines, then fix anything misread) → judge every line → act on it (decide the Ask first lines, show the advisor card, keep the result in history).

Success: the owner pays for what their car needs, declines what it doesn't, and walks away without feeling pushed or confrontational.

## Positioning

Verdicts come from the car's own manufacturer schedule (model, variant, year, service point), not general advice, and every answer shows its source. The owner can point to the line in their owner's manual.

The safety rule is the product's spine: the worst failure is telling a driver to skip work their car needs. *Say no* is issued only for a known upsell, matched with certainty, against the car's own schedule. Every other uncertain case becomes *Ask first*.

## Operating Context

- Used at the casa counter, standing, one-handed, under time pressure, often under shop lighting with glare on glossy quote paper. Also used beforehand to set up the car.
- The **advisor card** is handed across the counter: one screen listing only what the owner wants done, readable at arm's length in large type, with what they will pay. A polite sentence is provided for each declined line, to copy or read out.
- Quotes are paper sheets from the casa, photographed or typed in.
- Bilingual: English and Filipino, switchable from the top of any screen.
- Full system detail: `../../SYSTEM_DESIGN.md`. Visual tokens and components: `../DESIGN.md`. Design source: the Doop canvas "PMS Check", page "Version 3 · Glossy white".

## Capabilities and Constraints

- **Platform:** Expo (iOS and Android). One shared custom visual design on both; each OS keeps its native behaviors (back gesture, keyboard, permission prompts). Every change is checked on both, with no primary platform.
- **Offline:** a check never needs the network. Scan, parse, verdict, advisor card, and history run on the device. The network only refreshes the catalog and sends reports.
- **Privacy:** no accounts and no PII in v1. The quote photo exists only as a temporary file during recognition, is deleted right after (success or failure), and is never uploaded. Only parsed lines are kept. Analytics are anonymous and never include prices or free text.
- **Quote reading:** on-device OCR plus a deterministic parser. Lines it is unsure about are marked amber, and the owner fixes text, price, or the matched item before verdicts are calculated.
- **Verdicts** are computed once and saved with the quote; editing the car later doesn't change a saved result.
- **Reporting:** the owner can report a verdict they think is wrong from the item detail screen.
- **Terminology:** PMS (preventive maintenance service), casa (dealer service center), advisor, service point (for example "10,000 km / 12 months"), Say yes / Ask first / Say no, advisor card.
- **Undecided** (see `SYSTEM_DESIGN.md` §11): normal vs severe-conditions schedule as default; tolerance around a service point (1,000 km / 1 month assumed); whether out-of-range prices should yield Ask first; frames still missing for delivery month, the visit-confirm step, and accept/decline on Ask first lines.

## Brand Commitments

- **Name:** PMS Check.
- **Voice:** calm, plain, polite, on the owner's side. Short declarative sentences in the product's own terms. It gives the owner words to say, never a fight to pick; the advisor is not the enemy.
- **Verdict vocabulary** is fixed: Say yes, Ask first, Say no.
- **Languages:** English and Filipino carry equal weight.

## Evidence on Hand

- Product copy and FAQ on the landing page: `../../landing-page/src/pages/index.astro`; privacy policy: `../../landing-page/src/pages/privacy.astro`.
- Car body-style photos: `assets/images/cars/` (sedan, hatchback, suv, mpv, pickup).
- Sample catalog and quotes for development: `src/sample/`. These are stand-ins; the design's mock quote figures are known to be inconsistent (`SYSTEM_DESIGN.md` §11.6).
- Launch models named on the landing page: Toyota Vios, Wigo, Mitsubishi Mirage, Honda City, Suzuki Ertiga, Nissan Almera.
- **Absent, do not fabricate:** real casa quote photos and fixtures (build step 0), transcribed manual schedules beyond sample data, user testimonials, savings statistics, or accuracy figures.

## Product Principles

1. **Never tell a driver to skip what their car needs.** When unsure, the answer is Ask first.
2. **Every answer carries its source.** A verdict the owner can't point to in the manual is not finished.
3. **Built for the counter.** Seconds, one hand, glare, an advisor waiting. Anything that slows the decision there is a defect.
4. **Polite, not confrontational.** The product hands the owner calm words and a list to show, not an argument.
5. **The owner's data stays theirs.** Offline by default, no accounts, the quote photo is never kept.

## Accessibility & Inclusion

- English and Filipino throughout; neither is a secondary translation.
- The advisor card must read at arm's length in large type.
- Respect the OS Reduce Motion setting; motion never delays a decision.
- Verdicts are never told by color alone; each carries its word (Say yes, Ask first, Say no).
