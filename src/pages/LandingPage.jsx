import { motion } from "framer-motion";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import HeroVisual from "../components/HeroVisual.jsx";

const auditSteps = [
  { title: "Detect", copy: "Find adverse impact across groups before release." },
  { title: "Explain", copy: "Turn fairness metrics into plain-language review notes." },
  { title: "Fix", copy: "Prioritize the segments that need model or data action." }
];

export default function LandingPage() {
  return (
    <>
      <section className="hero-bg min-h-[calc(100vh-4rem)] border-b border-[#e5e7eb]">
        <div className="page-shell grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="mb-4 inline-flex rounded-xl bg-white/85 px-3 py-1 text-sm font-semibold text-google-blue shadow-card ring-1 ring-white/80">
              AI fairness audit platform
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-normal text-[#202124] sm:text-6xl lg:text-7xl">
              Ethicly
            </h1>
            <p className="mt-5 text-2xl font-semibold leading-snug text-[#3c4043] sm:text-3xl">
              Detect, Explain, and Fix AI Bias
            </p>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#5f6368] sm:text-lg">
              Audit model outcomes, compare group impact, and move from fairness risk to clear action in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/upload">Upload Dataset</Button>
              <Button to="/dashboard" variant="secondary">
                View Sample Audit
              </Button>
            </div>
          </motion.div>
          <HeroVisual />
        </div>
      </section>

      <section className="page-shell py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {auditSteps.map((step, index) => (
            <Card key={step.title} delay={index * 0.05}>
              <div className="mb-5 h-1.5 w-16 rounded-full bg-google-blue" />
              <h2 className="text-xl font-bold text-[#202124]">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f6368]">{step.copy}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
