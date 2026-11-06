import { useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { portfolioLinks } from "@/data/portfolio";
export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !message) {
      setStatus("Please add your name and a message.");
      return;
    }
    if (!portfolioLinks.formspree) {
      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      );
      window.location.href = `mailto:${portfolioLinks.email}?subject=${subject}&body=${body}`;
      setStatus(
        "Email draft opened. Please send it in your email app. Nothing has been sent automatically."
      );
      return;
    }
    setSending(true);
    setStatus("");
    try {
      const response = await fetch(portfolioLinks.formspree, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw Error();
      setStatus("Message sent. Thanks for reaching out.");
      form.reset();
    } catch {
      setStatus(
        "Could not send your message. Please email maniansanjey@gmail.com directly."
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="Your name"
          />
        </label>
        <label>
          Your email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label>
        Message
        <textarea
          name="message"
          required
          maxLength={5000}
          rows={4}
          placeholder="Tell me about your role or project."
        />
      </label>
      <button className="btn primary" type="submit" disabled={sending}>
        {sending ? <LoaderCircle size={17} /> : null}
        {portfolioLinks.formspree ? "Send message" : "Compose email"}
        <ArrowUpRight size={18} />
      </button>
      <p className="form-note">
        {portfolioLinks.formspree
          ? "Messages delivered securely via Formspree."
          : "Opens your email app. Direct delivery will be enabled when a form endpoint is added."}
      </p>
      <p role="status" className="form-status">
        {status}
      </p>
    </form>
  );
}
