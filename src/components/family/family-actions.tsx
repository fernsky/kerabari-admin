"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/loading-button";
import { Check, XCircle, Edit, Clock, CheckCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "requested_for_edit" | "rejected";

interface FamilyActionsProps {
  familyId: string;
  currentStatus: Status;
  onStatusChange: () => void;
}

const StatusBadge = ({ status }: { status: Status }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      text: "Pending",
      className: "bg-yellow-100 text-yellow-800",
    },
    approved: {
      icon: CheckCircle,
      text: "Approved",
      className: "bg-green-100 text-green-800",
    },
    requested_for_edit: {
      icon: Edit,
      text: "Edit Requested",
      className: "bg-blue-100 text-blue-800",
    },
    rejected: {
      icon: XCircle,
      text: "Rejected",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="mr-1 h-4 w-4" />
      {config.text}
    </div>
  );
};

export function FamilyActions({
  familyId,
  currentStatus,
  onStatusChange,
}: FamilyActionsProps) {
  const [message, setMessage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const approve = api.family.approve.useMutation({
    onSuccess: () => {
      toast.success("Family approved successfully");
      onStatusChange();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const requestEdit = api.family.requestEdit.useMutation({
    onSuccess: () => {
      toast.success("Edit requested successfully");
      setIsEditDialogOpen(false);
      setMessage("");
      onStatusChange();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reject = api.family.reject.useMutation({
    onSuccess: () => {
      toast.success("Family rejected successfully");
      setIsRejectDialogOpen(false);
      setMessage("");
      onStatusChange();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ familyId });
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const handleRequestEdit = async () => {
    if (!message) {
      toast.error("Please provide a reason for the edit request");
      return;
    }
    try {
      await requestEdit.mutateAsync({ familyId, message });
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  const handleReject = async () => {
    if (!message) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await reject.mutateAsync({ familyId, message });
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  // Only show actions if the family is in pending state
  const isActionable = currentStatus === "pending";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <StatusBadge status={currentStatus} />

        {isActionable && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleApprove}
              disabled={approve.isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Request Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Family Edit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="Provide details about what needs to be edited..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    onClick={handleRequestEdit}
                    loading={requestEdit.isLoading}
                  >
                    Submit Request
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Family</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="Provide reason for rejection..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsRejectDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    variant="destructive"
                    onClick={handleReject}
                    loading={reject.isLoading}
                  >
                    Reject Family
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
