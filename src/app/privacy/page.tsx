import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.legal.tradeName} collects, uses and protects your personal data.`,
  alternates: { canonical: "/privacy" },
};

const L = site.legal;

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <Section title="1. Who we are">
        <p>
          This website is run by {L.tradeName} (&ldquo;Leadsndeals&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a{" "}
          {L.constitution.toLowerCase()} owned by {L.owner}, at {site.contact.address}, India. We are the Data
          Fiduciary for the personal data described here under India&apos;s Digital Personal Data Protection Act, 2023
          (DPDP Act).
        </p>
      </Section>

      <Section title="2. What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <b>Demo request form:</b> your name, WhatsApp/phone number, and optionally your email, business name, the
            service you&apos;re interested in, your message and the demo slot you choose.
          </li>
          <li>
            <b>Chat with Lia (our website assistant):</b> the messages you type. If you use voice input, a short
            recording of your voice is sent for transcription.
          </li>
          <li>
            <b>WhatsApp:</b> when you message our WhatsApp number or tap a button on our messages, we receive your
            number, WhatsApp profile name and the messages you send.
          </li>
          <li>
            <b>Technical data:</b> basic server logs (such as IP address, browser type and time of visit) kept by our
            hosting provider for security and troubleshooting.
          </li>
        </ul>
        <p>We do not ask for, and you should not share, passwords, OTPs, card numbers or government ID numbers.</p>
      </Section>

      <Section title="3. Why we use it">
        <ul className="list-disc space-y-2 pl-5">
          <li>To respond to your enquiry, confirm your demo booking and call or message you about it.</li>
          <li>To answer your questions through Lia and our WhatsApp assistant.</li>
          <li>To keep a record of your enquiry in our customer management system so our team can follow up.</li>
          <li>To keep the website secure and working properly.</li>
        </ul>
        <p>
          We process this data on the basis of the consent you give when you submit the form, start a chat or message
          us. We do not sell your personal data, and we don&apos;t use it for advertising by third parties.
        </p>
      </Section>

      <Section title="4. Service providers we use">
        <p>To run these features, your data is processed by trusted providers acting on our instructions:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Vercel (website hosting)</li>
          <li>Anthropic (generates Lia&apos;s chat replies)</li>
          <li>Google Gemini (transcribes voice input)</li>
          <li>WAAU / Meta WhatsApp Business Platform (sends and receives WhatsApp messages)</li>
          <li>Our workflow automation (n8n) and customer management system, where enquiries are stored</li>
        </ul>
        <p>Some of these providers may store or process data outside India, with appropriate safeguards.</p>
      </Section>

      <Section title="5. How long we keep it">
        <p>
          We keep enquiry and lead records for as long as needed to serve you and for up to 24 months after our last
          contact, unless the law requires longer or you ask us to delete them sooner. Voice recordings are used only
          to create the transcript and are not stored by us. Your website chat history is kept only in your own browser
          for the current session.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>Under the DPDP Act you can:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>ask what personal data we hold about you and how it is used;</li>
          <li>ask us to correct, update or delete it;</li>
          <li>withdraw your consent at any time (for WhatsApp, reply STOP);</li>
          <li>nominate another person to exercise these rights on your behalf;</li>
          <li>raise a grievance with us, and if unresolved, with the Data Protection Board of India.</li>
        </ul>
      </Section>

      <Section title="7. Grievance officer and contact">
        <p>
          {L.owner}, {L.tradeName}
          <br />
          {site.contact.address}
          <br />
          Email: <a className="underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> · Phone:{" "}
          {site.contact.phones.join(" / ")}
        </p>
        <p>We aim to respond to every request within 30 days.</p>
      </Section>

      <Section title="8. Security">
        <p>
          We use reasonable technical and organisational measures to protect your data, including encrypted (HTTPS)
          connections and access controls on our systems. No method of transmission over the internet is completely
          secure, but we work to protect your information.
        </p>
      </Section>

      <Section title="9. Children">
        <p>Our services are meant for businesses. We do not knowingly collect personal data from children under 18.</p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>We may update this policy from time to time. The latest version will always be available on this page.</p>
      </Section>
    </LegalPage>
  );
}
