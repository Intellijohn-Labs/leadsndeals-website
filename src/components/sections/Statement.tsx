import ScrollWordReveal from "@/components/motion/ScrollWordReveal";

export default function Statement() {
  return (
    <section data-section="Why automation" className="relative py-28 sm:py-40">
      <div className="container-x">
        <ScrollWordReveal
          className="display max-w-[1100px] text-[clamp(30px,4.6vw,64px)] leading-[1.04] text-fg"
          text="Customers message at midnight — on WhatsApp, on Instagram, from your website. Most businesses reply the next morning. Yours can reply in *seconds,* follow up on its own, and hand your team only the conversations that are ready to *buy.*"
        />
      </div>
    </section>
  );
}
