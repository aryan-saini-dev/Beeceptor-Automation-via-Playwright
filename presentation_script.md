# 🎥 Video Walkthrough Script (2–3 Minutes)

This script is structured to keep you under the **3-minute limit** while showcasing your understanding of the HTTP Callout feature, your engineering decisions, and a live automation demo.

---

## ⏱️ Section 1: Intro & Feature Overview (0:00 – 0:40)

**🎬 Visual Action:**
- Start with your webcam active, introducing yourself.
- Open the Beeceptor dashboard page on your screen (`https://app.beeceptor.com`).

**🗣️ Speaking Script:**
> "Hi everyone, my name is **[Your Name]**, and today I am showcasing my end-to-end automation suite for testing the Beeceptor HTTP Callout Rule.
> 
> Beeceptor is an API mockup and proxy platform. The **HTTP Callout Rule** is a specific proxy rule that lets Beeceptor bridge incoming calls with outgoing webhook payloads. When an incoming request hits a matched endpoint, Beeceptor simultaneously returns a mock response to the caller and fires a new outbound request to a target webhook handler or external server. 
> 
> This is extremely useful in real engineering for testing asynchronous callback flows (like Stripe/PayPal webhooks) without waiting for slow backend tasks."

---

## ⏱️ Section 2: Code Architecture & Design Decisions (0:40 – 1:20)

**🎬 Visual Action:**
- Share your screen showing **VS Code** with [tests/beeceptorPage.js](./tests/beeceptorPage.js) and [tests/beeceptor-callout.spec.js](./tests/beeceptor-callout.spec.js).
- Highlight key methods in the POM.

**🗣️ Speaking Script:**
> "To build this, I chose Playwright and structured it using a strict **Page Object Model** pattern inside `beeceptorPage.js` to ensure the tests are readable and easy to maintain.
> 
> I made a few key decisions to guarantee the suite is bulletproof:
> 1. **Authentication Session Sharing**: We log in once using `auth.setup.js` and save the browser state to a JSON file. All E2E tests reuse this session, avoiding rate-limiting on Beeceptor's login form.
> 2. **Pre-test Cleanup**: Because Beeceptor's free tier caps endpoints at 3 active rules, the suite runs a cleanup loop before any test starts to delete any matching test rules from prior runs.
> 3. **Self-Healing Navigation**: If a previous run fails and leaves a modal form open, the Page Object Model automatically cancels it to restore the modal list view, preventing click interception errors.
> 4. **Auto-Confirming Dialogs**: Deleting rules in Beeceptor triggers a browser dialog. I registered a listener in the Page Object constructor to automatically accept these confirmation boxes."

---

## ⏱️ Section 3: Live Automation Demo (1:20 – 2:30)

**🎬 Visual Action:**
- Open your terminal and run the headed command:
  `npx playwright test --project=beeceptor-tests --headed`
- Position the terminal on one side and watch the browser window pop up on the other.
- Narrate as the browser navigates, opens the Mock Rules modal, creates the Callout rule pointing to `httpbin.org/post`, triggers the POST request in the background, reloads the dashboard to verify the callout trace, and finally deletes the rule.

**🗣️ Speaking Script:**
> "Now let's run the full test suite in headed mode so you can see it execute live. 
> 
> As the browser launches, it navigates directly to the dashboard using our saved session. It opens the Mock Rules modal, launches the New Callout Rule form, and enters our configuration details. 
> 
> After saving the rule, the test triggers a real HTTP POST request to our Beeceptor endpoint. Playwright then reloads the dashboard, clicks on the request log, and verifies that the outbound callout execution was successfully recorded.
> 
> Finally, the suite navigates back to the modal and deletes the rule to clean up the test state. All 10 E2E tests are passing successfully!"

---

## ⏱️ Section 4: Wrap-up (2:30 – 2:45)

**🎬 Visual Action:**
- Switch back to your webcam.

**🗣️ Speaking Script:**
> "By combining a modular Page Object Model, session caching, and self-healing UI guards, we've automated the entire HTTP Callout workflow end-to-end. Thank you for your time, and I look forward to your feedback!"
