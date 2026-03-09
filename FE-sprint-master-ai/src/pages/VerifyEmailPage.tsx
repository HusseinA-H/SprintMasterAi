import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * /verify-email?token=<TOKEN>
 *
 * Payload CMS verification URL:  POST /api/users/verify/{token}
 * The verification email (generated in Users.ts) points here.
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setErrorMsg("No verification token found in the URL.");
      setStatus("error");
      return;
    }

    const apiBase =
      import.meta.env.VITE_API_URL && typeof import.meta.env.VITE_API_URL === "string"
        ? import.meta.env.VITE_API_URL
        : "http://localhost:3000";

    fetch(`${apiBase}/api/users/verify/${token}`, { method: "POST" })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          setErrorMsg(data.message || "Verification failed. The link may have expired.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error — could not reach the server.");
        setStatus("error");
      });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-full max-w-md bento-card p-10 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verifying your email…</h1>
            <p className="text-muted-foreground text-sm">Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Email verified!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Your account is now active. Redirecting you to login…
            </p>
            <Link to="/login">
              <Button className="gradient-button border-0 w-full">Go to Login now</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Verification failed</h1>
            <p className="text-muted-foreground text-sm mb-6">{errorMsg}</p>
            <Link to="/register">
              <Button variant="outline" className="w-full border-border/60 bg-muted/40">
                Back to Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
