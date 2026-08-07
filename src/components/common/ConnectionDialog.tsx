"use client";

import React, { useState } from "react";
import { Lock, Clock, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: "not_connected" | "pending";
  onSendRequest: () => Promise<void>;
}

export function ConnectionDialog({
  isOpen,
  onClose,
  status,
  onSendRequest,
}: ConnectionDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendRequest = async () => {
    try {
      setIsSending(true);
      await onSendRequest();
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === "pending" ? (
              <>
                <Clock className="w-5 h-5 text-amber-500" />
                Request Pending
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-primary" />
                Connection Required
              </>
            )}
          </DialogTitle>
          <DialogDescription className="pt-3 pb-1 text-sm leading-relaxed text-foreground/80">
            {status === "pending" ? (
              <>
                Your connection request has already been sent.
                <br />
                <br />
                You can start chatting after the other user accepts it.
              </>
            ) : (
              <>
                You need to connect with this user before you can start chatting.
                <br />
                <br />
                Send a connection request first. Once the other user accepts it,
                messaging will become available.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-4">
          {status === "pending" ? (
            <Button type="button" onClick={onClose} className="w-full sm:w-auto">
              OK
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="w-full sm:w-auto"
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendRequest}
                isLoading={isSending}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Connection Request
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
