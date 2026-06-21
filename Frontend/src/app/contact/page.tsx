"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin, Send } from "lucide-react";

import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";

const CONTACT_EMAIL = "baisakh2015@gmail.com";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      "",
      message.trim(),
    ].join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject.trim(),
    )}&body=${encodeURIComponent(body)}`;

    setPrepared(true);
    window.location.assign(mailto);
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
        <p>Send a message through your device&apos;s configured email application.</p>
      </header>

      <section className="contact-grid">
        <aside className="contact-info">
          <Mail size={28} />
          <h2 style={{ fontSize: 40, letterSpacing: "-.05em" }}>
            Reach the project team.
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", lineHeight: 1.8 }}>
            Complete the form and your default email application will open with the
            message prepared for you.
          </p>
          <p>
            <MapPin size={17} style={{ display: "inline", marginRight: 8 }} />
            Bangladesh
          </p>
          <p>
            <Mail size={17} style={{ display: "inline", marginRight: 8 }} />
            {CONTACT_EMAIL}
          </p>
        </aside>

        <div className="surface contact-form">
          {prepared ? (
            <div className="success-box">
              The message was prepared in your email application. You can edit it there
              before sending.
            </div>
          ) : null}

          <form onSubmit={submit} className="form-grid">
            <div className="field">
              <label className="label" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="field full">
              <label className="label" htmlFor="contact-subject">
                Subject
              </label>
              <input
                id="contact-subject"
                className="input"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
              />
            </div>

            <div className="field full">
              <label className="label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                className="textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
            </div>

            <button className="button red full" type="submit">
              <Send size={17} />
              Prepare email
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </PublicShell>
  );
}
