import { Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ConfirmEmailPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="w-full max-w-md bento-card p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-2xl font-bold mb-3">Check your inbox</h1>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        We sent a verification link to your email address. Click that link to activate your account and start sprinting.
      </p>

      <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-4 text-left mb-6">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span>Check your spam / junk folder if you don't see it</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span>The link expires in 24 hours</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span>During development the link is logged to the backend terminal</span>
        </div>
      </div>

      <Link to="/login">
        <Button variant="outline" className="w-full border-border/60 bg-muted/40">
          Go to Login
        </Button>
      </Link>
    </div>
  </div>
);

export default ConfirmEmailPage;
