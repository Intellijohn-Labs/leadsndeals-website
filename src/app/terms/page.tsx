import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for using the website and services of ${site.legal.tradeName}.`,
  alternates: { canonical: "/terms" },
};

const L = site.legal;

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <Section title="1. About these terms">
        <p>
          These terms apply to this website and to the services provided by {L.tradeName}, a{" "}
          {L.constitution.toLowerCase()} owned by {L.owner}, {site.contact.address} (&ldquo;Leadsndeals&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the website or our services, you agree to these terms. Specific
          projects may also be covered by a separate quotation or agreement, which takes priority where it differs.
        </p>
      </Section>

      <Section title="2. Our services">
        <p>
          We provide WhatsApp, Instagram, Facebook and website chatbots, bulk and transactional SMS, e-commerce stores,
          workflow automation, CRM integrations, website and mobile app development, and related support, as described on
          this website or in your quotation.
        </p>
      </Section>

      <Section title="3. Prices and payment">
        <ul className="list-disc space-y-2 pl-5">
          <li>Prices shown on the website are in Indian Rupees and exclude 18% GST unless stated otherwise.</li>
          <li>
            WhatsApp message charges follow Meta&apos;s published rates, which may change. AI usage may be charged
            separately, as stated in your plan.
          </li>
          <li>Custom work (websites, apps, integrations, workflows) is charged as per the agreed quotation.</li>
          <li>Plans and SMS packages are prepaid. Services may be paused if payment is overdue.</li>
        </ul>
      </Section>

      <Section title="4. Your responsibilities">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use our services only for lawful purposes and in line with the WhatsApp Business, Meta and TRAI/DLT rules
            that apply to your messages.
          </li>
          <li>Message only people who have agreed to hear from you, and honour opt-out requests.</li>
          <li>
            Provide accurate business details and the approvals needed for setup (for example Meta business
            verification, message templates and DLT registration for SMS).
          </li>
          <li>You are responsible for the content you send through our services and for keeping your login details safe.</li>
        </ul>
      </Section>

      <Section title="5. Third-party platforms">
        <p>
          Our services rely on platforms such as Meta (WhatsApp, Instagram, Facebook), telecom operators, payment
          gateways and cloud providers. Their availability, policies, approvals and pricing are outside our control, and we
          are not responsible for interruptions or changes caused by them.
        </p>
      </Section>

      <Section title="6. AI assistants">
        <p>
          Our chatbots and website assistant (Lia) use artificial intelligence. Their answers are generated automatically
          and may occasionally be incomplete or inaccurate. Prices, timelines and commitments are confirmed only by our team
          in writing.
        </p>
      </Section>

      <Section title="7. Intellectual property">
        <p>
          The website, our brand and our materials belong to us. Content and data you provide remain yours. On full
          payment, you receive the rights agreed in your quotation for work we build specifically for you.
        </p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>
          We provide our services with reasonable skill and care. To the extent permitted by law, we are not liable for
          indirect or consequential losses, lost profits or lost data, and our total liability for any claim is limited to
          the amount you paid us for the affected service in the three months before the claim.
        </p>
      </Section>

      <Section title="9. Ending the service">
        <p>
          You can stop a monthly plan at the end of any billing period. We may suspend or end services if these terms are
          seriously breached, if payment is not made, or if a platform provider requires it.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>
          These terms are governed by the laws of India. Any dispute will be subject to the courts of {L.district},{" "}
          {L.state}.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          {L.tradeName}, {site.contact.address}
          <br />
          Email: <a className="underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> · Phone:{" "}
          {site.contact.phones.join(" / ")}
        </p>
      </Section>
    </LegalPage>
  );
}
