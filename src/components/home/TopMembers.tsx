"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";
import { UserProfile } from "@/features/profiles/types/profile";
import { AuthGuardModal } from "./AuthGuardModal";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface TopMembersProps {
  members: UserProfile[];
}

export function TopMembers({ members }: TopMembersProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGuardedAction = async (uid: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    // For logged-in users on the home page, we might just redirect them to the skills directory 
    // to handle actual connection logic, or let the parent component pass actual handlers.
    // Given the constraints, if they are logged in, we should ideally handle connection, 
    // but the home page is meant to be a showcase. We can prompt them to go to the directory.
    window.location.href = `/skills?user=${uid}`;
  };

  return (
    <section className="py-24 bg-card/30 relative">
      <div className="container mx-auto max-w-6xl px-4">
        
        <div className="mb-12 text-center">
          <Badge variant="primary" className="mb-3 px-3 py-1">Top Talent</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Meet Our Active Members</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">
            Connect with top-rated students who are actively collaborating and building amazing things.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <motion.div
              key={member.uid}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProfileCard
                profile={member}
                onConnect={handleGuardedAction}
                onMessage={handleGuardedAction}
                isConnecting={false}
              />
            </motion.div>
          ))}
        </div>

      </div>

      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        title="Login to Connect"
        description="You must be logged in to connect with members and send messages."
      />
    </section>
  );
}
