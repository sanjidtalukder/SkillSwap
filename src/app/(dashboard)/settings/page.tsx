"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentProfile } from "@/features/profiles/hooks/useCurrentProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api-client";
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Palette, 
  AlertTriangle, 
  Key,
  LogOut,
  Trash2
} from "lucide-react";
import { authService } from "@/features/auth/services/authService";

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "account", label: "Account", icon: Key },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useCurrentProfile(user, authLoading);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const res = await fetchWithAuth("/api/settings");
        const data = await res.json();
        if (data.data) {
          setSettings(data.data);
        }
      } catch (err) {
        toast.error("Failed to load settings.");
      } finally {
        setIsLoadingSettings(false);
      }
    }
    fetchSettings();
  }, [user]);

  const updateSetting = async (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setIsSaving(true);
    try {
      const res = await fetchWithAuth("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        toast.success("Settings updated");
      } else {
        toast.error("Failed to update setting");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/");
  };

  if (authLoading || profileLoading || isLoadingSettings) {
    return <div className="flex h-[400px] items-center justify-center"><Spinner /></div>;
  }

  if (!user || !profile || !settings) {
    return <Alert variant="error">Unable to load account data.</Alert>;
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? tab.danger 
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>This is how others will see you on the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <Avatar src={profile.photo} alt={profile.fullName} className="w-24 h-24 border-2 border-border/50" />
                  <div className="space-y-1 flex-1">
                    <h3 className="text-xl font-semibold">{profile.fullName}</h3>
                    <p className="text-muted-foreground">@{profile.username}</p>
                    {profile.university && <p className="text-sm">🎓 {profile.university}</p>}
                    <p className="text-sm mt-2 max-w-lg text-foreground/80 line-clamp-3">{profile.bio}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/40 flex justify-end">
                  <Link href="/complete-profile?mode=edit">
                    <Button variant="primary">Edit Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACCOUNT SETTINGS */}
          {activeTab === "account" && (
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your email and password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email || ""} 
                    disabled 
                    className="w-full p-2.5 rounded-lg bg-muted/50 border border-border text-muted-foreground opacity-70 cursor-not-allowed" 
                  />
                  <p className="text-xs text-muted-foreground">Your email address is managed by your authentication provider.</p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Password</h4>
                    <p className="text-xs text-muted-foreground">Change your password if you signed up with email.</p>
                  </div>
                  <Button variant="outline" disabled>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRIVACY SETTINGS */}
          {activeTab === "privacy" && (
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control who can see your profile and contact you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow 
                  label="Allow profile to appear in search" 
                  description="Others can find you when searching for your skills."
                  checked={settings.searchAppearance} 
                  onChange={(c) => updateSetting("searchAppearance", c)} 
                />
                <ToggleRow 
                  label="Show online status" 
                  description="Let others know when you are active on the platform."
                  checked={settings.showOnlineStatus} 
                  onChange={(c) => updateSetting("showOnlineStatus", c)} 
                />
                <ToggleRow 
                  label="Allow connection requests" 
                  description="Anyone can send you a connection request."
                  checked={settings.allowConnectionRequests} 
                  onChange={(c) => updateSetting("allowConnectionRequests", c)} 
                />
                <ToggleRow 
                  label="Allow project invitations" 
                  description="Project owners can invite you to their projects."
                  checked={settings.allowProjectInvitations} 
                  onChange={(c) => updateSetting("allowProjectInvitations", c)} 
                />
                
                <div className="pt-4 border-t border-border/40">
                  <label className="text-sm font-medium text-foreground mb-2 block">Receive messages from</label>
                  <select 
                    value={settings.messagePrivacy} 
                    onChange={(e) => updateSetting("messagePrivacy", e.target.value)}
                    className="w-full md:w-1/2 p-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="connections">Connections Only</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NOTIFICATIONS SETTINGS */}
          {activeTab === "notifications" && (
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow 
                  label="Connection Requests" 
                  checked={settings.notifyConnectionRequests} 
                  onChange={(c) => updateSetting("notifyConnectionRequests", c)} 
                />
                <ToggleRow 
                  label="Project Requests" 
                  checked={settings.notifyProjectRequests} 
                  onChange={(c) => updateSetting("notifyProjectRequests", c)} 
                />
                <ToggleRow 
                  label="Project Accepted" 
                  checked={settings.notifyProjectAccepted} 
                  onChange={(c) => updateSetting("notifyProjectAccepted", c)} 
                />
                <ToggleRow 
                  label="Direct Messages" 
                  checked={settings.notifyMessages} 
                  onChange={(c) => updateSetting("notifyMessages", c)} 
                />
                <ToggleRow 
                  label="System Notifications" 
                  checked={settings.notifySystem} 
                  onChange={(c) => updateSetting("notifySystem", c)} 
                />
                <ToggleRow 
                  label="Email Notifications" 
                  description="Receive important updates via email."
                  checked={settings.notifyEmail} 
                  onChange={(c) => updateSetting("notifyEmail", c)} 
                />
              </CardContent>
            </Card>
          )}

          {/* APPEARANCE SETTINGS */}
          {activeTab === "appearance" && (
            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground block">Theme Preference</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["dark", "light", "system"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateSetting("theme", t)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                          settings.theme === t 
                            ? "border-primary bg-primary/5" 
                            : "border-border/50 hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-full h-16 rounded-md ${t === 'light' ? 'bg-white border' : t === 'dark' ? 'bg-slate-950 border border-slate-800' : 'bg-gradient-to-r from-white to-slate-950 border'}`}></div>
                        <span className="text-sm font-medium capitalize">{t} Mode</span>
                      </button>
                    ))}
                  </div>
                  {settings.theme !== 'dark' && (
                    <p className="text-xs text-warning mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Note: Currently only Dark Mode is fully supported.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DANGER ZONE */}
          {activeTab === "danger" && (
            <Card className="border-destructive/30 bg-destructive/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Sign Out</h4>
                    <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-destructive/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full md:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
                
                {showDeleteConfirm && (
                  <div className="mt-4 p-4 border border-destructive rounded-lg bg-destructive/10 animate-in fade-in">
                    <p className="text-sm font-medium mb-3">Are you sure? This action cannot be undone.</p>
                    <div className="flex gap-3">
                      <Button variant="destructive" size="sm" onClick={() => toast.error("Account deletion disabled in demo.")}>Yes, delete</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}

// Helper Component
function ToggleRow({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button 
        role="switch" 
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
