import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { CartDrawer } from "./CartDrawer";
import { MobileMenu } from "./MobileMenu";
import { LoginModal } from "./LoginModal";
import { User, LayoutDashboard, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/Guzone_Logo.jpg" 
              alt="Guzone Logo" 
              className="h-8 w-auto sm:h-10"
            />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Guzone
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            {t("products")}
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartDrawer />
          {isAuthenticated && user?.role === 'admin' && (
            <Button variant="ghost" size="sm" className="hidden lg:flex" asChild>
              <Link to="/admin">
                <LayoutDashboard className="h-4 w-4" />
                <span className="ml-2">Admin</span>
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline">{user?.email?.split('@')[0] || t("account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'customer' && (
                  <DropdownMenuItem onClick={() => navigate("/customer/dashboard")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Customer Dashboard
                  </DropdownMenuItem>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  logout();
                  navigate("/");
                }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => {
                  setIsSignupMode(false);
                  setShowLogin(true);
                }}
              >
                <User className="h-4 w-4" />
                <span className="ml-2">{t("login")}</span>
              </Button>
              <Button 
                size="sm" 
                className="hidden sm:flex bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                onClick={() => {
                  setIsSignupMode(true);
                  setShowLogin(true);
                }}
              >
                {t("signup")}
              </Button>
            </>
          )}
        </div>
        
        <LoginModal 
          open={showLogin} 
          onOpenChange={setShowLogin}
          initialMode={isSignupMode ? 'signup' : 'login'}
          onLoginSuccess={() => {
            setShowLogin(false);
            // Navigation will be handled by LoginModal based on user role
          }}
        />
      </div>
    </header>
  );
}
