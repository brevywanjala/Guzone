import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, LayoutDashboard, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "./LoginModal";

export function MobileMenu() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            to="/suppliers"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
          >
            {t("suppliers")}
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
          >
            {t("products")}
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
          >
            {t("howItWorks")}
          </Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                >
                  Admin Dashboard
                </Link>
              )}
              {user?.role === 'customer' && (
                <Link
                  to="/customer/dashboard"
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                >
                  Customer Dashboard
                </Link>
              )}
              <div className="border-t pt-4 mt-4">
                <div className="px-2 py-2 text-sm">
                  <div className="font-medium">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-2"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="border-t pt-4 mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setIsSignupMode(false);
                  setShowLogin(true);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                {t("login")}
              </Button>
              <Button
                className="w-full justify-start bg-gradient-to-r from-primary to-accent text-primary-foreground"
                onClick={() => {
                  setIsSignupMode(true);
                  setShowLogin(true);
                }}
              >
                {t("signup")}
              </Button>
            </div>
          )}
        </nav>
        
        <LoginModal 
          open={showLogin} 
          onOpenChange={setShowLogin}
          initialMode={isSignupMode ? 'signup' : 'login'}
          onLoginSuccess={() => {
            setShowLogin(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
