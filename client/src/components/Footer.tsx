import { Link } from "react-router-dom";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Guzone
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecter l'Afrique Centrale et l'Afrique de l'Est à travers le commerce B2B.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Produits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-foreground transition-colors">Produits</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">À propos</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">Comment ça marche</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-colors">Centre d'aide</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Guzone. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
