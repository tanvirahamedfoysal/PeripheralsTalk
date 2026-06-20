import Link from "next/link";
import { Brand } from "./brand";
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Brand light />
          <h3 style={{ marginTop: 30 }}>
            Talk hardware.
            <br />
            Build knowledge.
          </h3>
          <p style={{ maxWidth: 440 }}>
            A structured community archive for computer peripherals, technical
            specifications and informed discussion.
          </p>
        </div>
        <div>
          <b>Explore</b>
          <div className="footer-links">
            <Link href="/categories">All categories</Link>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <b>Account</b>
          <div className="footer-links">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div>
          <b>Platform</b>
          <div className="footer-links">
            <span>14 peripheral families</span>
            <span>Role-based publishing</span>
            <span>Community moderation</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PeripheralsTalk</span>
        <span>Built for useful hardware conversations.</span>
      </div>
    </footer>
  );
}
