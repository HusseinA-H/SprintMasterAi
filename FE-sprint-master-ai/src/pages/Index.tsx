import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Target, Clock, ArrowRight, Check, ChevronDown, Sparkles, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

const NAV_LINKS = ["Features", "Pricing", "FAQ"];

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bento-card border-t-0 rounded-none border-x-0">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AI Daily Sprint" className="h-10 w-auto object-contain" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) =>
          <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l}
            </a>
          )}
        </div>
        <Button onClick={handleGetStarted} className="gradient-button border-0 px-5 h-9 text-sm">
          Get Started
        </Button>
      </div>
    </nav>);

}

function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePrimaryCta = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
      </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 bento-card px-4 py-1.5 mb-8 text-xs font-medium text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            AI-Powered One-Day Sprint Planning for Any Domain
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 max-w-4xl mx-auto tracking-tighter">
            Plan One Day of Focused Work <span className="gradient-text">In Seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            From business goals to exams to product tasks, get a domain-relevant sprint plan that fits within 1-24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handlePrimaryCta} className="gradient-button border-0 h-12 px-8 text-base gap-2">
              Generate My First Sprint <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            </Button>
            <Button variant="outline" className="h-12 px-8 text-base border-border/60 bg-white/5 hover:bg-white/10" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>
              See Demo <Eye className="w-4 h-4 ml-2 flex-shrink-0" strokeWidth={1.5} />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>);

}

function HowItWorks() {
  const steps = [
  { icon: Target, title: "Define Your Goal", desc: "Paste any goal from any domain — business, study, operations, software, or personal work." },
  { icon: Sparkles, title: "AI Generates Sprint", desc: "Get a practical one-day plan with subtasks, priorities, and time estimates." },
  { icon: BarChart3, title: "Execute & Track", desc: "Work through the plan, check off tasks, and finish your one-day sprint." }];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Three steps from idea to an executable one-day sprint</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s, i) =>
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bento-card p-8 text-center group hover:glow-border transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs font-mono text-primary mb-2">STEP {i + 1}</div>
              <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}

function Benefits() {
  const items = [
  { icon: Target, title: "Clarity", desc: "Turn ambiguous goals into concrete, time-boxed one-day actions." },
  { icon: Zap, title: "Versatility", desc: "Generate plans for work, study, business, operations, or technical execution." },
  { icon: Clock, title: "Focus", desc: "Keep plans realistic: 1 to 24 hours, never multi-day." }];

  return (
    <section className="py-24 bg-transparent relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Teams and Individuals Use It</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {items.map((item, i) =>
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="bento-card p-8">
              <item.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}

function CreativityCloudDemo() {
  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/30 rounded-full blur-[120px]" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-accent">The Creativity Cloud</h2>
        <p className="text-muted-foreground text-center mb-16 text-lg">A continuous loop of productivity: Goal → Plan → Ship</p>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent -translate-y-1/2 z-0"></div>

          {/* Goal Node */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 bento-card p-8 w-full md:w-1/3 text-center border-border/40">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_hsl(15_50%_55%_/_0.3)]">
              <Target className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Set Goal</h3>
            <p className="text-sm text-card-foreground/70">Define what you want to achieve today.</p>
          </motion.div>

          {/* Plan Node */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="relative z-10 bento-card p-10 w-full md:w-1/3 text-center border-primary/40 shadow-[0_0_50px_-10px_hsl(160_60%_75%_/_0.4)]">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Zap className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-accent">2. AI Plan</h3>
            <p className="text-sm text-card-foreground/70">Instantly generate a structured daily sprint.</p>
          </motion.div>

          {/* Ship Node */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="relative z-10 bento-card p-8 w-full md:w-1/3 text-center border-border/40">
            <div className="w-16 h-16 rounded-full bg-[#ffb399]/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_hsl(20_80%_75%_/_0.4)]">
              <Check className="w-8 h-8" style={{ color: 'hsl(20, 80%, 65%)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Ship It</h3>
            <p className="text-sm text-card-foreground/70">Execute subtasks and finish your day strong.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
  { name: "Free", price: "$0", period: "/forever", features: ["3 one-day sprints per month", "Basic AI generation", "Task tracking"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "$9", period: "/month", features: ["Unlimited one-day sprints", "Detailed AI generation", "Pro-only regenerate", "Priority support"], cta: "Go Pro", highlight: true }];

  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 bg-transparent relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground text-center mb-16 text-lg">Start free. Upgrade when you're ready.</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) =>
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`bento-card p-8 flex flex-col ${plan.highlight ? "border-primary/40 shadow-[0_8px_32px_-8px_hsl(160_60%_75%_/_0.3)]" : ""}`}>
              {plan.highlight && <div className="text-xs font-mono text-primary mb-4">MOST POPULAR</div>}
              <h3 className="text-2xl font-bold mb-1 text-accent">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6 text-card-foreground">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-card-foreground/70 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) =>
              <li key={f} className="flex items-center gap-2 text-sm text-card-foreground/80">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
              )}
              </ul>
              <Button
                onClick={() => {
                  if (plan.highlight) {
                    toast("Coming soon");
                    return;
                  }
                  navigate("/dashboard");
                }}
                className={plan.highlight ? "gradient-button border-0 h-11" : "h-11 bg-card-foreground/10 hover:bg-card-foreground/20 text-card-foreground border-0"}
              >
                {plan.cta}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}

function FAQ() {
  const faqs = [
  { q: "How does the AI generate sprint plans?", a: "Our AI analyzes your goal and creates a domain-relevant one-day sprint with actionable subtasks and durations." },
  { q: "Can I edit the generated plan?", a: "Absolutely. Every task title, duration, and detail is fully editable. The AI gives you a starting point—you refine it to fit your workflow." },
  { q: "What if my goal needs more than 24 hours?", a: "The planner keeps each sprint in the 1-24 hour range and encourages splitting big goals into multiple one-day sprints." },
  { q: "Is my code or project data stored?", a: "We store only the goals you submit and generated sprint plans. The tool works across technical and non-technical domains." }];

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) =>
          <details key={faq.q} className="bento-card group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
            </details>
          )}
        </div>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-semibold">AI Daily Sprint</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 AI Daily Sprint. Ship faster, every day.</p>
      </div>
    </footer>);

}

const LandingPage = () =>
<div className="min-h-screen text-foreground bg-transparent">
    <Navbar />
    <Hero />
    <HowItWorks />
    <Benefits />
    <CreativityCloudDemo />
    <Pricing />
    <FAQ />
    <Footer />
  </div>;


export default LandingPage;
