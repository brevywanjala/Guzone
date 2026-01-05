import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/Guzone_Logo.jpg" 
                alt="Guzone Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Guzone
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footerDescription")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footerProducts")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-foreground transition-colors">{t("products")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footerCompany")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t("about")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footerContact")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+254710168286" className="hover:text-foreground transition-colors">
                  +254710168286
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@guzones.com" className="hover:text-foreground transition-colors">
                  info@guzones.com
                </a>
              </li>
              <li className="pt-2">
                <Link to="/terms" className="hover:text-foreground transition-colors">{t("terms")}</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">{t("privacy")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{t("footerCopyright")}</p>
        </div>
      </div>
    </footer>
  );
}
