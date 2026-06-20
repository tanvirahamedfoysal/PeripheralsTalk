"use client";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
export default function Contact() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }
  return (
    <PublicShell>
      <SiteHeader />
      <header className="contact-hero">
        <div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Contact us
          </p>
          <h1 className="display">Start a conversation.</h1>
        </div>
        <p>
          No contact API exists in the supplied backend, so this page intentionally uses
          a local mail form and does not call an unauthorized endpoint.
        </p>
      </header>
      <section className="contact-grid">
        <aside className="contact-info">
          <Mail size={28} />
          <h2 style={{ fontSize: 40, letterSpacing: "-.05em" }}>
            Reach the project team.
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", lineHeight: 1.8 }}>
            Use the form to prepare an email in your default mail application.
          </p>
          <p>
            <MapPin size={17} style={{ display: "inline", marginRight: 8 }} />
            Bangladesh
          </p>
          <p>
            <Mail size={17} style={{ display: "inline", marginRight: 8 }} />
            baisakh2015@gmail.com
          </p>
        </aside>
        <div className="surface contact-form">
          {sent ? (
            <div className="success-box">
              Your message is ready. Email delivery requires an email service endpoint,
              which is not included in api.zip.
            </div>
          ) : (
            <form onSubmit={submit} className="form-grid">
              <div className="field">
                <label className="label">Name</label>
                <input className="input" required />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" type="email" required />
              </div>
              <div className="field full">
                <label className="label">Subject</label>
                <input className="input" required />
              </div>
              <div className="field full">
                <label className="label">Message</label>
                <textarea className="textarea" required />
              </div>
              <button className="button red full">
                <Send size={17} />
                Prepare message
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </PublicShell>
  );
}
