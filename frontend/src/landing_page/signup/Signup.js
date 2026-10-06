import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL =
  process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

const investmentOptions = [
  {
    icon: "📈",
    title: "Stocks",
    description: "Invest in all exchange-listed securities",
  },
  {
    icon: "💰",
    title: "Mutual funds",
    description: "Invest in commission-free direct mutual funds",
  },
  {
    icon: "📊",
    title: "IPO",
    description: "Apply to the latest IPOs instantly via UPI",
  },
  {
    icon: "📉",
    title: "Futures & options",
    description:
      "Hedge and mitigate market risk through simplified F&O trading",
  },
];

const accountTypes = [
  {
    title: "Individual Account",
    description: "Invest in equity, mutual funds and derivatives",
  },
  {
    title: "HUF Account",
    description: "Make tax-efficient investments for your family",
  },
  {
    title: "NRI Account",
    description: "Invest in equity, mutual funds, debentures, and more",
  },
  {
    title: "Minor Account",
    description: "Teach your little ones about money & invest for their future",
  },
  {
    title: "Corporate / LLP / Partnership",
    description: "Manage your business surplus and investments easily",
  },
];

const faqs = [
  "What is a Zerodha account?",
  "What documents are required to open a demat account?",
  "Is Zerodha account opening free?",
  "Are there any AMC (Account Maintenance Charges) for a demat account?",
  "Can I open a demat account without a bank account?",
  "What is a Basic Services Demat Account (BSDA)?",
  "Can I open a demat and trading account using the mobile app?",
];

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "", email: "", mobile: "", password: "", pan: "", city: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(formData.mobile.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
          pan: formData.pan.trim().toUpperCase(),
          city: formData.city.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create your account.");
      localStorage.setItem("zerodhaUser", JSON.stringify(data.user));
      window.location.assign(DASHBOARD_URL);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <section className="signup-hero">
        <h1>Open a free demat and trading account online</h1>

        <p>
          Start investing brokerage free and join a community of 1.6+ crore
          investors and traders
        </p>

        <div className="signup-hero-content">
          <div className="hero-dashboard">
            <div className="dashboard-window">
              <div className="dashboard-top">
                <span>Reports and analytics</span>
                <span className="console">console</span>
              </div>

              <div className="dashboard-body">
                <div className="watchlist">
                  <div>Kite</div>
                  <small>Ultra-fast investing platform</small>
                </div>

                <div className="chart">
                  <div className="chart-bar"></div>
                  <div className="chart-line"></div>
                  <div className="chart-bottom"></div>
                </div>

                <div className="dashboard-circle">₹43K</div>
              </div>

              <div className="dashboard-footer">
                <span>COIN</span>
                <span>Zero commission</span>
              </div>
            </div>
          </div>

          <div className="signup-form">
            <h2>Signup now</h2>
            <p>Open your demat and trading account.</p>
            <form onSubmit={handleSignup}>
              <div className="signup-fields">
                <input name="fullName" placeholder="Full name" value={formData.fullName} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleChange} required />
                <div className="mobile-input">
                  <span className="india">+91</span>
                  <input name="mobile" type="tel" inputMode="numeric" placeholder="10-digit mobile number" value={formData.mobile} onChange={handleChange} required />
                </div>
                <input name="password" type="password" placeholder="Password (minimum 8 characters)" value={formData.password} onChange={handleChange} minLength="8" required />
                <input name="pan" placeholder="PAN (optional)" value={formData.pan} onChange={handleChange} />
                <input name="city" placeholder="City (optional)" value={formData.city} onChange={handleChange} />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className="terms">
              By proceeding, you agree to the Zerodha{" "}
              <a href="/support">terms & privacy policy</a>.
            </p>
            <p className="existing">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
            {/* Legacy mock sign-up UI retained only as a reference.
            {user ? (
              <div className="account-panel">
                <h2>Welcome back</h2>
                <p className="account-name">{user.fullName}</p>
                <div className="account-box">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {user.mobile}
                  </p>
                  <div className="account-actions">
                    <button
                      type="button"
                      className="primary-btn account-button"
                      onClick={() => {
                        window.location.href = REACT_APP_DASHBOARD_URL;
                      }}
                    >
                      Account
                    </button>
                    <button
                      type="button"
                      className="secondary-btn logout-button"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2>Signup now</h2>

                <p>Or track your existing application</p>

                <form onSubmit={handleGetOtp}>
                  <div className="mobile-input">
                    <span className="india">🇮🇳 +91</span>
                    <input
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value)}
                    />
                  </div>

                  <button type="submit" className="primary-btn">
                    Get OTP
                  </button>
                </form>

                <p className="terms">
                  By proceeding, you agree to the Zerodha{" "}
                  <a href="/support">terms & privacy policy</a>
                </p>

                <p className="existing">
                  Looking to open NRI account? <a href="/support">Click here</a>
                </p>
              </>
            )}
            */}
          </div>
        </div>
      </section>

      <section className="existing-account">
        <h2>Already have a demat account?</h2>

        <p>
          Move your holdings to Zerodha and we'll cover your transfer costs,
          up to ₹500, <a href="/support">learn more</a>.
        </p>
      </section>

      <section className="investment-section">
        <h2>Investment options with Zerodha demat account</h2>

        <div className="investment-grid">
          {investmentOptions.map((item, index) => (
            <div className="investment-item" key={index}>
              <div className="investment-icon">{item.icon}</div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="secondary-btn">Explore Investments</button>
      </section>

      <section className="steps-section">
        <h2>Steps to open a demat account with Zerodha</h2>

        <div className="steps-container">
          <div className="steps-image">
            <div className="video-card">
              <div className="video-screen">
                <span>▶</span>
              </div>

              <div className="video-person"></div>
              <div className="video-card-small"></div>
            </div>
          </div>

          <div className="steps-list">
            <div className="step">
              <span>01</span>
              <p>Enter the requested details</p>
            </div>

            <div className="step">
              <span>02</span>
              <p>Complete e-sign & verification</p>
            </div>

            <div className="step">
              <span>03</span>
              <p>Start investing!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="benefits-image">
          <div className="benefit-graphic">
            <div className="percentage">%</div>
            <div className="bar bar-one"></div>
            <div className="bar bar-two"></div>
            <div className="bar bar-three"></div>
            <div className="circle"></div>
          </div>

          <h2>Benefits of opening a Zerodha demat account</h2>
        </div>

        <div className="benefits-list">
          <div>
            <h3>Unbeatable pricing</h3>
            <p>
              Zero charges for equity & mutual fund investments. Flat ₹20 fees
              for intraday and F&O trades.
            </p>
          </div>

          <div>
            <h3>Best investing experience</h3>
            <p>
              Simple and intuitive trading platform with an easy-to-understand
              user interface.
            </p>
          </div>

          <div>
            <h3>No spam or gimmicks</h3>
            <p>
              Committed to transparency — no gimmicks, spam, "gamification",
              or intrusive push notifications.
            </p>
          </div>

          <div>
            <h3>The Zerodha universe</h3>
            <p>
              More than just an app — gain free access to the entire ecosystem
              of our partner products.
            </p>
          </div>
        </div>
      </section>

      <section className="account-section">
        <h2>Explore different account types</h2>

        <div className="account-grid">
          {accountTypes.map((account, index) => (
            <div className="account-card" key={index}>
              <div className="account-icon">◉</div>

              <div>
                <h3>{account.title}</h3>
                <p>{account.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <h2>FAQs</h2>

        <div className="faq-list">
          {faqs.map((question, index) => (
            <details key={index} className="faq-item">
              <summary>
                <span>{question}</span>
                <span>⌄</span>
              </summary>

              <p>
                This information is available in the Zerodha account opening
                documentation. Please refer to the relevant account opening
                requirements.
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <h2>Open a Zerodha account</h2>

        <p>
          Simple and intuitive apps · ₹20 for investments · ₹20 for intraday
          and F&O trades.
        </p>

        <button className="primary-btn">Sign up for free</button>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">ZERODHA</div>

            <p>
              © 2010 - 2026, Zerodha Broking Ltd.
              <br />
              All rights reserved.
            </p>

            <div className="social-icons">
              <span>𝕏</span>
              <span>f</span>
              <span>in</span>
              <span>◎</span>
            </div>

            <div className="app-buttons">
              <button>Google Play</button>
              <button>App Store</button>
            </div>
          </div>

          <div className="footer-column">
            <h3>Account</h3>
            <a href="/signup">Open demat account</a>
            <a href="/signup">Minor demat account</a>
            <a href="/signup">NRI demat account</a>
            <a href="/signup">HUF demat account</a>
            <a href="/product">Commodity</a>
            <a href="/product">Dematerialization</a>
            <a href="/pricing">Fund transfer</a>
            <a href="/pricing">MTF</a>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <a href="/support">Contact us</a>
            <a href="/support">Support portal</a>
            <a href="/support">How to file a complaint?</a>
            <a href="/support">Status of your complaints</a>
            <a href="/support">Bulletin</a>
            <a href="/support">Circular</a>
            <a href="/about">Z-Connect blog</a>
            <a href="/about">Download</a>
          </div>

          <div className="footer-column">
            <h3>Company</h3>
            <a href="/about">About</a>
            <a href="/about">Philosophy</a>
            <a href="/about">Press & media</a>
            <a href="/support">Careers</a>
            <a href="/support">Zerodha Cares (CSR)</a>
            <a href="/product">Zerodha.tech</a>
            <a href="/product">Open source</a>
            <a href="/pricing">Referral program</a>
          </div>

          <div className="footer-column">
            <h3>Quick links</h3>
            <a href="/product">Upcoming IPOs</a>
            <a href="/pricing">Brokerage charges</a>
            <a href="/pricing">Market holidays</a>
            <a href="/about">Economic calendar</a>
            <a href="/support">Calculators</a>
            <a href="/product">Market</a>
            <a href="/product">Sectors</a>
            <a href="/product">Gift Nifty</a>
          </div>
        </div>

        <div className="footer-disclaimer">
          <p>
            Zerodha Broking Limited: Member of NSE, BSE & MCX. Registration
            numbers and regulatory information. Zerodha is a technology-first
            financial services company that provides investing and trading
            platforms.
          </p>

          <p>
            Investments in securities market are subject to market risks. Read
            all the related documents carefully before investing. Please
            consult your financial advisor before making investment decisions.
          </p>

          <p>
            The information provided on this website is for educational and
            informational purposes only and should not be considered financial
            advice.
          </p>
        </div>

        <div className="footer-bottom">
          <span>NSE</span>
          <span>BSE</span>
          <span>MCX</span>
          <span>Terms & conditions</span>
          <span>Policies</span>
          <span>Privacy policy</span>
          <span>Disclosure</span>
          <span>For investors</span>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
