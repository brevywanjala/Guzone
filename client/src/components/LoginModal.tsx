import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/config";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void | Promise<void>;
  initialMode?: 'login' | 'signup';
  skipRedirect?: boolean; // Set to true to skip automatic redirect (e.g., for checkout flow)
}

export function LoginModal({ open, onOpenChange, onLoginSuccess, initialMode = 'login', skipRedirect = false }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { googleAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    console.log("🔵 [LoginModal] Google sign-in button clicked");
    console.log("🔵 [LoginModal] Auth object:", auth);
    console.log("🔵 [LoginModal] Google provider:", googleProvider);
    console.log("🔵 [LoginModal] Firebase config check:", {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Present" : "❌ Missing",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Present" : "❌ Missing",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Present" : "❌ Missing",
    });
    
    setLoading(true);
    try {
      console.log("🔵 [LoginModal] Attempting signInWithPopup...");
      // Sign in with Firebase Google Auth
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ [LoginModal] Sign-in successful:", result);
      const user = result.user;
      
      // Get the ID token from Firebase
      const idToken = await user.getIdToken();
      
      // Send token to backend
      const { user: backendUser, isNewUser } = await googleAuth(idToken);
      
      toast({
        title: "Success",
        description: isNewUser ? "Account created successfully!" : "Logged in successfully!",
      });
      
      onOpenChange(false);
      
      // Call success callback if provided (for checkout flow or other actions)
      // Use Promise.resolve to handle both sync and async callbacks
      await Promise.resolve(onLoginSuccess?.());
      
      // Always redirect based on user role (unless skipRedirect is true, e.g., for checkout)
      if (!skipRedirect) {
        if (backendUser?.role === 'customer') {
          console.log("🔵 [LoginModal] Redirecting to customer dashboard");
          navigate("/customer/dashboard", { replace: true });
        } else if (backendUser?.role === 'admin') {
          console.log("🔵 [LoginModal] Redirecting to admin dashboard");
          navigate("/admin", { replace: true });
        } else {
          console.log("🔵 [LoginModal] No role found, redirecting to home");
          navigate("/", { replace: true });
        }
      } else {
        console.log("🔵 [LoginModal] Skipping redirect (skipRedirect=true)");
      }
    } catch (error: any) {
      console.error("❌ [LoginModal] Google sign-in error:", error);
      console.error("❌ [LoginModal] Error code:", error.code);
      console.error("❌ [LoginModal] Error message:", error.message);
      console.error("❌ [LoginModal] Full error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Google authentication failed. Please try again.";
      
      // Handle specific Firebase errors
      if (error.code === "auth/configuration-not-found" || error.code === 400 || error.code === "auth/configuration-not-found") {
        errorMessage = "Firebase configuration error. Please ensure Google Authentication is enabled in Firebase Console and your domain is authorized.";
        console.error("❌ [LoginModal] CONFIGURATION_NOT_FOUND - Check Firebase Console:");
        console.error("   1. Go to Firebase Console → Authentication → Sign-in method");
        console.error("   2. Enable Google Authentication");
        console.error("   3. Go to Settings → Authorized domains");
        console.error("   4. Add 'localhost' if not present");
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("🔵 [LoginModal] Sign-in process completed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialMode === 'signup' ? "Create Account" : "Login to Continue"}
          </DialogTitle>
          <DialogDescription>
            {initialMode === 'signup'
              ? "Sign up with Google to complete your checkout"
              : "Please login with Google to proceed with checkout"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Processing..." : initialMode === 'signup' ? "Sign up with Google" : "Sign in with Google"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
