"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <section className="py-24 bg-card/20 border-t border-border/40">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recent Platform Activity</h2>
            <p className="text-sm text-muted-foreground">Live updates from our community</p>
          </div>
        </div>

        <div className="relative border-l-2 border-border/60 ml-5 space-y-8 pb-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative pl-8"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20 shadow-sm" />
              
              <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors">
                <p className="text-foreground font-medium text-base mb-1">
                  {activity.content}
                </p>
                <time className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </time>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
