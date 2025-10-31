import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Theme = "light" | "dark" | "gray" | "auto";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Age handling state
  const [ageHandlingEnabled, setAgeHandlingEnabled] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAge(user.age?.toString() || "");
      setAgeHandlingEnabled(user.ageHandlingEnabled || false);
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/profile", {
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        age: age ? parseInt(age) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: Theme) => {
      await apiRequest("PATCH", "/api/settings", { theme: newTheme });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Theme updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update theme.",
        variant: "destructive",
      });
    },
  });

  const updateAgeHandlingMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; passcode?: string }) => {
      await apiRequest("PATCH", "/api/settings", {
        ageHandlingEnabled: data.enabled,
        ageHandlingPasscode: data.passcode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowPasscodeModal(false);
      setPasscode("");
      setConfirmPasscode("");
      toast({
        title: "Success",
        description: "Age handling settings updated.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update age handling.",
        variant: "destructive",
      });
    },
  });

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    updateThemeMutation.mutate(newTheme);
  };

  const handleAgeHandlingToggle = (checked: boolean) => {
    if (checked && !user?.ageHandlingPasscode) {
      // First time enabling - need passcode
      setShowPasscodeModal(true);
    } else {
      // Toggle off or already has passcode
      setAgeHandlingEnabled(checked);
      updateAgeHandlingMutation.mutate({ enabled: checked });
    }
  };

  const handlePasscodeSubmit = () => {
    if (passcode !== confirmPasscode) {
      toast({
        title: "Error",
        description: "Passcodes do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passcode.length < 4) {
      toast({
        title: "Error",
        description: "Passcode must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }
    setAgeHandlingEnabled(true);
    updateAgeHandlingMutation.mutate({ enabled: true, passcode });
  };

  const themes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "gray" as const, label: "Gray", icon: Monitor },
    { value: "auto" as const, label: "Auto", icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold" data-testid="text-page-title">
          Settings
        </h1>

        {/* Appearance Section */}
        <section className="mb-8 pb-8 border-b">
          <h2 className="mb-4 text-xl font-medium">Appearance</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Customize how RelateAI looks for you.
          </p>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <Card
                  key={t.value}
                  className={`p-4 cursor-pointer hover-elevate ${
                    isActive ? "border-2 border-primary" : ""
                  }`}
                  onClick={() => handleThemeChange(t.value)}
                  data-testid={`button-theme-${t.value}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{t.label}</span>
                    {isActive && (
                      <Check className="h-4 w-4 text-primary" data-testid="icon-theme-active" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Profile Section */}
        <section className="mb-8 pb-8 border-b">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">Profile Information</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details.
              </p>
            </div>
            {!isEditingProfile && (
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(true)}
                data-testid="button-edit-profile"
              >
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium mb-2">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditingProfile}
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium mb-2">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditingProfile}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2">
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                data-testid="input-email"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-medium mb-2">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditingProfile}
                placeholder="(555) 123-4567"
                data-testid="input-phone"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-sm font-medium mb-2">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={!isEditingProfile}
                data-testid="input-age"
              />
              {age && parseInt(age) < 18 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  You are in Teen Mode - safe, age-appropriate content only
                </p>
              )}
            </div>

            {isEditingProfile && (
              <div className="flex gap-2">
                <Button
                  onClick={() => updateProfileMutation.mutate()}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setFirstName(user?.firstName || "");
                    setLastName(user?.lastName || "");
                    setPhoneNumber(user?.phoneNumber || "");
                    setAge(user?.age?.toString() || "");
                  }}
                  data-testid="button-cancel-profile"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Age Handling Section */}
        <section>
          <h2 className="mb-4 text-xl font-medium">Age Handling</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Control age-based content filtering with passcode protection.
          </p>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">Age Handling Toggle</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.ageHandlingPasscode
                    ? "Toggle age-based content filtering on or off"
                    : "First-time setup requires a passcode"}
                </p>
              </div>
              <Switch
                checked={ageHandlingEnabled}
                onCheckedChange={handleAgeHandlingToggle}
                disabled={updateAgeHandlingMutation.isPending}
                data-testid="switch-age-handling"
              />
            </div>
          </Card>
        </section>
      </main>

      {/* Passcode Modal */}
      <Dialog open={showPasscodeModal} onOpenChange={setShowPasscodeModal}>
        <DialogContent className="max-w-sm" data-testid="dialog-passcode">
          <DialogHeader>
            <DialogTitle>Set Age Handling Passcode</DialogTitle>
            <DialogDescription>
              Create a passcode to protect age handling settings. This cannot be changed later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                data-testid="input-passcode"
              />
            </div>
            <div>
              <Label htmlFor="confirmPasscode">Confirm Passcode</Label>
              <Input
                id="confirmPasscode"
                type="password"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Confirm passcode"
                data-testid="input-confirm-passcode"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePasscodeSubmit}
                disabled={updateAgeHandlingMutation.isPending}
                className="flex-1"
                data-testid="button-submit-passcode"
              >
                {updateAgeHandlingMutation.isPending ? "Setting..." : "Set Passcode"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasscodeModal(false);
                  setPasscode("");
                  setConfirmPasscode("");
                }}
                data-testid="button-cancel-passcode"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
