#!/usr/bin/env python3
"""Full interaction test of the PK Hosting + Travel.pk app, as a real user.
Serves the app on localhost, drives it with Playwright, clicks every tab,
button, form and toggle, and screenshots each state. Fails loudly on any
JS error or failed assertion.
"""
import http.server, functools, threading, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.expanduser("~/workspace/pkhosting-travel-app")
SHOTS = os.path.join(ROOT, "test-shots")
os.makedirs(SHOTS, exist_ok=True)
PORT = 8931

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()

errors = []
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond:
        fails.append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1280, "height": 900})
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
    check("page title", "PK Hosting" in page.title())
    check("home view visible", page.locator("#view-home.active").is_visible())
    page.screenshot(path=f"{SHOTS}/01-home.png")

    # Nav: Hosting tab
    page.click('button.navbtn[data-nav="hosting"]')
    check("hosting view visible", page.locator("#view-hosting.active").is_visible())
    check("home hidden after hosting click", not page.locator("#view-home.active").is_visible())
    page.screenshot(path=f"{SHOTS}/02-hosting.png")

    # Domain search
    page.fill("#domain-name", "mybusiness")
    page.select_option("#domain-ext", ".com")
    page.click("#domain-form button[type=submit]")
    res = page.locator("#domain-result")
    check("domain result shown", res.is_visible())
    check("domain result has price", "Rs 3,299" in res.inner_text())
    check("domain result has name", "mybusiness.com" in res.inner_text())
    page.screenshot(path=f"{SHOTS}/03-domain.png")

    # Plan toggle: renewal then back
    page.click("#toggle-renew")
    first_price = page.locator(".plan-card").first.locator(".plan-now").inner_text()
    check("renewal price Personal is 6990", first_price == "Rs 6,990")
    page.click("#toggle-first")
    first_price = page.locator(".plan-card").first.locator(".plan-now").inner_text()
    check("first-year price Personal back to 4490", first_price == "Rs 4,490")
    page.screenshot(path=f"{SHOTS}/04-plans.png")

    # Order modal
    page.click('.plan-card.featured [data-order="Business Hosting"]')
    check("order modal opens", page.locator("#order-modal").is_visible())
    check("order modal names plan", "Business Hosting" in page.locator("#order-plan").inner_text())
    check("order modal shows payment info", "0300 6410099" in page.locator("#order-modal").inner_text())
    check("order modal shows IBAN", "PK27SCBL0000001729340301" in page.locator("#order-modal").inner_text())
    check("order modal says info only", "Information only" in page.locator("#order-modal").inner_text())
    page.screenshot(path=f"{SHOTS}/05-order-modal.png")
    page.click("#order-close")
    check("order modal closes", not page.locator("#order-modal").is_visible())

    # Nav: Travel tab
    page.click('button.navbtn[data-nav="travel"]')
    check("travel view visible", page.locator("#view-travel.active").is_visible())
    page.screenshot(path=f"{SHOTS}/06-travel.png")

    # Flight search: verified route LHE-DXB
    page.select_option("#flight-from", "LHE")
    page.select_option("#flight-to", "DXB")
    page.fill("#flight-date", "2026-11-24")
    page.click("#flight-form button[type=submit]")
    results = page.locator("#flight-results")
    check("LHE-DXB shows fare", "Rs108,251" in results.inner_text())
    check("LHE-DXB shows flights count", "11 flights" in results.inner_text())
    check("LHE-DXB shows Dec fare too", "Rs109,790" in results.inner_text())
    page.screenshot(path=f"{SHOTS}/07-flight-lhedxb.png")

    # Book with team modal
    page.click('#flight-results [data-book]')
    check("book modal opens", page.locator("#book-modal").is_visible())
    check("book modal shows phone", "+92 42 3569 2952" in page.locator("#book-modal").inner_text())
    check("book modal says no payment here", "No payment is taken here" in page.locator("#book-modal").inner_text())
    page.screenshot(path=f"{SHOTS}/08-book-modal.png")
    page.click("#book-close")
    check("book modal closes", not page.locator("#book-modal").is_visible())

    # Flight search: unknown route
    page.select_option("#flight-from", "LHE")
    page.select_option("#flight-to", "IST")
    page.click("#flight-form button[type=submit]")
    check("unknown route honest message", "No stored fare" in results.inner_text())
    check("unknown route points to travel.pk", "travel.pk" in results.inner_text())

    # Flight search: ISB-DXB
    page.select_option("#flight-from", "ISB")
    page.select_option("#flight-to", "DXB")
    page.click("#flight-form button[type=submit]")
    check("ISB-DXB shows fare", "Rs104,098" in results.inner_text())

    # Same city guard
    page.select_option("#flight-from", "KHI")
    page.select_option("#flight-to", "DXB")
    page.select_option("#flight-from", "LHE")
    page.select_option("#flight-to", "DXB")
    # Packages
    check("12 package cards", page.locator("#pkg-grid .pkg-card").count() == 12)
    check("package says tailored quote", "Tailored quote" in page.locator("#pkg-grid").inner_text())
    page.locator('#pkg-grid [data-book]').first.click()
    check("package quote opens book modal", page.locator("#book-modal").is_visible())
    page.keyboard.press("Escape")
    check("escape closes modal", not page.locator("#book-modal").is_visible())

    # FAQ toggle
    faq = page.locator(".faq details").first
    faq.locator("summary").click()
    check("FAQ opens", faq.get_attribute("open") is not None)
    page.screenshot(path=f"{SHOTS}/09-travel-bottom.png")

    # Destinations and visa counts
    check("8 destination cards", page.locator(".dest-card").count() == 8)
    check("10 visa cards", page.locator(".visa").count() == 10)
    check("Hunza season present", "April to October" in page.locator("#destinations").inner_text())

    # Back to home
    page.click('button.navbtn[data-nav="home"]')
    check("home view visible again", page.locator("#view-home.active").is_visible())

    # Mobile viewport
    page.set_viewport_size({"width": 390, "height": 844})
    page.click('button.navbtn[data-nav="hosting"]')
    check("mobile hosting renders", page.locator("#view-hosting.active").is_visible())
    page.screenshot(path=f"{SHOTS}/10-mobile-hosting.png")
    page.click('button.navbtn[data-nav="travel"]')
    check("mobile travel renders", page.locator("#view-travel.active").is_visible())
    page.screenshot(path=f"{SHOTS}/11-mobile-travel.png")

    b.close()

srv.shutdown()
print("JS console/page errors:", errors if errors else "none")
if errors:
    fails.append("js errors present")
print()
if fails:
    print("FAILED:", len(fails))
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("ALL TESTS PASSED")
