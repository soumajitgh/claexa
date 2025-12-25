import React from 'react';
import { Link, Outlet } from 'react-router';
import {Sheet, SheetClose, SheetContent, SheetTrigger} from '@/components/ui/sheet'; // Assuming shadcn/ui sheet is here
import {Menu} from 'lucide-react'; // Assuming lucide-react for icons
import logoPath from '@/assets/logo/logo-light-c.png';
const navLinks = [
  {href: '/l/privacy-policy', label: 'Privacy Policy'},
  {href: '/l/refund-policy', label: 'Refund Policy'},
  {href: '/l/terms-of-service', label: 'Terms of Service'},
  {href: '/l/user-agreement', label: 'User Agreement'},
];

const LegalLayout: React.FC = () => {
  // Placeholder for logo - replace with actual <img /> tag once path is known
  const LogoPlaceholder = () => (
    <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800 hover:text-gray-600">
      <img src={logoPath} alt="Claexa AI Logo" className="h-8 w-auto" />
      Claexa AI
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <LogoPlaceholder/>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation - Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
                  <Menu className="h-6 w-6"/>
                  <span className="sr-only">Open menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="p-4">
                  <div className="mb-8">
                    <LogoPlaceholder/>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          to={link.href}
                          className="text-md font-medium text-gray-700 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>

      <footer className="py-6 md:px-8 md:py-0 bg-gray-50 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {new Date().getFullYear()} Claexa AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;

