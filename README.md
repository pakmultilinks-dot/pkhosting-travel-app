# PK Hosting and Travel.pk - One App

One app for two TechAbout services: PK Hosting and Travel.pk.

Live: https://pakmultilinks-dot.github.io/pkhosting-travel-app/

## What it does

Three views, switched from the top bar:

- **Home** - an overview of both services, with quick stats.
- **Hosting** - PK Hosting, green theme. Domain search with the real published
  prices (.com Rs 3,299/yr, .pk/.com.pk/.org.pk/.net.pk Rs 3,899/2yr, Black
  Friday prices), the three shared plans (Personal, Business, Professional)
  with a first-year vs renewal price toggle, features, the TechAbout network
  sites strip, and contact details.
- **Travel** - Travel.pk, deep blue/teal theme. Flight search that returns the
  verified fares for Lahore to Dubai and Islamabad to Dubai (checked live in
  November 2026) and an honest message for any other route, 8 destination
  cards with best season, 12 packages (all "Tailored quote"), visa guidance
  for 10 countries, services, the real FAQ from travel.pk, and contact details.

## Honesty rules in this app

- No invented prices, testimonials, reviews, booking confirmations or payment
  flows.
- Flight fares are labelled as live estimates checked in November 2026 that
  change daily.
- "Order Now" opens an information panel with the real checkout steps
  (JazzCash/EasyPaisa 0300 6410099, Standard Chartered IBAN
  PK27SCBL0000001729340301, card via Stripe). No payment is taken here.
- "Book with the team" opens an information panel with the Travel.pk team's
  phone, email and hours. No booking is made here.
- Domain search shows prices only. Availability is checked live on
  pkhosting.com.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/

## Test

`test-app.py` drives the app with Playwright and clicks every tab, button,
form and toggle (38 checks, desktop and mobile viewports). Run it with:

```sh
python3 test-app.py
```

## Files

- `index.html` - the whole app markup
- `styles.css` - all styling
- `app.js` - navigation, domain search, plan toggle, flight search, modals
- `test-app.py` - interaction tests
