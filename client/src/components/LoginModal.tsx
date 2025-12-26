import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

export function LoginModal({ open, onOpenChange, onLoginSuccess, initialMode = 'login' }: LoginModalProps) {
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  
  // Update isSignup when initialMode changes or modal opens
  useEffect(() => {
    if (open) {
      setIsSignup(initialMode === 'signup');
    }
  }, [open, initialMode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { login, signup, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Validate password length
        if (password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const userData = await signup(email, password);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        onOpenChange(false);
        // Call success callback if provided (for checkout flow)
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Navigate based on user role
          if (userData?.role === 'customer') {
            navigate("/customer/dashboard");
          } else if (userData?.role === 'admin') {
            navigate("/admin");
          }
        }
      } else {
        const userData = await login(email, password);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        onOpenChange(false);
        // Call success callback if provided (for checkout flow)
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Navigate based on user role
          if (userData?.role === 'customer') {
            navigate("/customer/dashboard");
          } else if (userData?.role === 'admin') {
            navigate("/admin");
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignup ? "Create Account" : "Login to Continue"}
          </DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Sign up to complete your checkout"
              : "Please login to proceed with checkout"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isSignup
                ? "Sign Up"
                : "Login"}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-xs"
              onClick={() => setIsSignup(!isSignup)}
              disabled={loading}
            >
              {isSignup ? "Login" : "Sign Up"}
            </Button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
