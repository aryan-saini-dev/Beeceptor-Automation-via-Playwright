# Beeceptor HTTP Callout Rule – End-to-End Playwright Automation

A professional, resilient end-to-end automation suite built with Playwright (JavaScript) to automate the configuration, triggering, validation, and cleanup of the **Beeceptor HTTP Callout Rule** feature.

---

## 📡 What is Beeceptor?
**[Beeceptor](https://beeceptor.com)** is a powerful mock server and API proxy platform. It allows developers to intercept, inspect, mock, and route HTTP requests. It is commonly used for mobile app development, testing webhook integrations, and mock-testing microservices.

---

## 🔗 The HTTP Callout Feature
The **HTTP Callout Rule** allows Beeceptor to act as an automated bridge/webhook trigger. When an incoming request matches specified criteria (Method & Path), Beeceptor simultaneously:
1. **Responds** to the client with a predefined mock response.
2. **Fires an outbound HTTP request** (a callout/callback) to a third-party target URL (e.g., `httpbin.org/post` or your system's webhook callback handler).

### When to use it:
- **Webhook Testing**: Simulating asynchronous callbacks from services like Stripe, PayPal, or GitHub.
- **Microservices Orchestration**: Triggering subsequent downstream tasks after an API endpoint is hit.
- **Integration Validation**: Asserting that backend systems successfully call third-party APIs with correct payloads.

### Workflow Architecture:
```text
  [ Client Request ]
         ↓
  [ POST /api/callout-test ]
         ↓
  +------------------ Beeceptor Endpoint ------------------+
  |  1. Immediately responds to Client (e.g., 200 OK)      |
  |  2. Fires asynchronous outbound POST request to:       |
  |     https://httpbin.org/post                           |
  +--------------------------------------------------------+
```

---

## 🎭 Playwright Automation Architecture
Our automation utilizes modern Playwright best practices to ensure high speed, stability, and zero test-flakiness.

### Key Pillars:
1. **Page Object Model (POM)**: Located in [beeceptorPage.js](./tests/beeceptorPage.js). It fully encapsulates selectors and complex console interactions (opening/closing modals, form configuration, row deletion).
2. **Preserved Authentication Session**: Authentication is handled once in a dedicated setup project ([auth.setup.js](./tests/auth.setup.js)). The logged-in session cookies/storage are saved locally in `.auth/user.json` and reused across all E2E tests, avoiding repetitive login flows.
3. **Resilient Self-Healing Selectors**:
   - **Pre-Test Cleanup**: Automatically detects and deletes any lingering test rules in the `beforeAll` hook to prevent hitting Beeceptor's **free tier limit of 3 rules**.
   - **Self-Healing Modal Navigation**: Checks if a form is open inside the Mock Rules modal; if so, it clicks "Cancel" automatically to return to the rules list view, ensuring dropdown carets are always clickable.
   - **Auto-Confirming Dialogs**: Automatically listens for and accepts standard `window.confirm` dialogs triggered when deleting a rule, bypassing Playwright's default auto-dismiss behavior.
   - **Case-Insensitive Button Matching**: Uses regex-based role locators (e.g. `getByRole('button', { name: /Save/i })`) to robustly match buttons containing checkmarks ("✓ Save").

---

## 🚀 How to Run the Assignment

### 1. Installation
Install dependencies and the required Chromium browser:
```bash
npm install
npx playwright install chromium
```

### 2. Configure Credentials
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Populate `.env` with your Beeceptor credentials and test endpoint name:
BEECEPTOR_EMAIL=your_email@example.com
BEECEPTOR_PASSWORD=your_password
BEECEPTOR_ENDPOINT=pw-callout-test
```

### 3. Run the Automation

* **Headed Mode (Watch the browser execute live on screen - Recommended for recording demo videos)**:
  This opens the browser automatically, navigating to the console, configuring rules, and deleting them step-by-step:
  ```bash
  npx playwright test --project=beeceptor-tests --headed
  ```

* **Interactive UI Mode**:
  Opens Playwright's interactive runner showing screenshots, trace timelines, and DOM states for each action:
  ```bash
  npx playwright test --project=beeceptor-tests --ui
  ```

* **Headless Mode (Silent terminal run)**:
  Runs the entire suite in the background:
  ```bash
  npx playwright test --project=beeceptor-tests
  ```

* **Show Test execution report**:
  Displays a comprehensive HTML dashboard of the test run:
  ```bash
  npx playwright show-report
  ```

---

## 📂 Project Structure
```text
├── tests/
│   ├── auth.setup.js            # Login once, saves cookies/session state
│   ├── beeceptorPage.js         # POM (encapsulates modals, forms, list interactions)
│   └── beeceptor-callout.spec.js # E2E Test Suite (10 complete test cases)
├── playwright/
│   └── .auth/
│       └── user.json            # Preserved auth session (git-ignored)
├── playwright.config.js         # Global Playwright settings
├── .env                         # Local environment configs
└── package.json
```
