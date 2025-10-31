import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Settings, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const navLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold">RelateAI</span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={isActive ? "font-semibold" : ""}
                    data-testid={`link-${link.label.toLowerCase()}`}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profileImageUrl || undefined}
                        alt={user?.firstName || "User"}
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.profileImageUrl || undefined}
                        alt={user?.firstName || "User"}
                      />
                      <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium" data-testid="text-user-name">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full cursor-pointer" data-testid="link-settings-menu">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="w-full cursor-pointer" data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">Log in</a>
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isActive ? "font-semibold" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
