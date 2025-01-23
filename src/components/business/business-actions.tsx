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
import {
  Check,
  XCircle,
  Edit,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type BuildingStatus =
  | "pending"
  | "approved"
  | "requested_for_edit"
  | "rejected";

interface BuildingActionsProps {
  buildingId: string;
  currentStatus: BuildingStatus;
  onStatusChange?: () => void;
}

const StatusBadge = ({ status }: { status: BuildingStatus }) => {
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

export function BuildingActions({
  buildingId,
  currentStatus,
  onStatusChange,
}: BuildingActionsProps) {
  const [message, setMessage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const approve = api.building.approve.useMutation({
    onSuccess: () => {
      toast.success("Building approved successfully");
      onStatusChange?.();
    },
  });

  const requestEdit = api.building.requestEdit.useMutation({
    onSuccess: () => {
      toast.success("Edit requested successfully");
      setIsEditDialogOpen(false);
      setMessage("");
      onStatusChange?.();
    },
  });

  const reject = api.building.reject.useMutation({
    onSuccess: () => {
      toast.success("Building rejected successfully");
      setIsRejectDialogOpen(false);
      setMessage("");
      onStatusChange?.();
    },
  });

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ buildingId });
    } catch (error) {
      toast.error("Failed to approve building");
    }
  };

  const handleRequestEdit = async () => {
    if (!message) {
      toast.error("Please provide a reason for the edit request");
      return;
    }
    try {
      await requestEdit.mutateAsync({ buildingId, message });
    } catch (error) {
      toast.error("Failed to request edit");
    }
  };

  const handleReject = async () => {
    if (!message) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await reject.mutateAsync({ buildingId, message });
    } catch (error) {
      toast.error("Failed to reject building");
    }
  };

  // Helper function to determine if actions are allowed
  const isActionable = currentStatus === "pending";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <StatusBadge status={currentStatus} />

        {/* Only show actions if the building is in pending state */}
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
                  <DialogTitle>Request Building Edit</DialogTitle>
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
                  <DialogTitle>Reject Building</DialogTitle>
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
                    Reject Building
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Show status message for edit requested state */}
        {currentStatus === "requested_for_edit" && (
          <p className="text-sm text-muted-foreground">
            Waiting for enumerator to edit the building data
          </p>
        )}
      </div>
    </div>
  );
}

type Status = "approved" | "pending" | "requested_for_edit" | "rejected";

export function BusinessActions({
  businessId,
  currentStatus,
  onStatusChange,
}: {
  businessId: string;
  currentStatus: Status;
  onStatusChange: () => void;
}) {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const { mutate: requestEdit, isLoading: isRequesting } =
    api.business.requestEdit.useMutation({
      onSuccess: () => {
        toast.success("Edit request sent successfully");
        setOpen(false);
        onStatusChange();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: approve, isLoading: isApproving } =
    api.business.approve.useMutation({
      onSuccess: () => {
        toast.success("Business approved successfully");
        onStatusChange();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: reject, isLoading: isRejecting } =
    api.business.reject.useMutation({
      onSuccess: () => {
        toast.success("Business rejected successfully");
        onStatusChange();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Badge>{currentStatus}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Request Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Edit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isRequesting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => requestEdit({ businessId, message })}
                disabled={isRequesting}
              >
                {isRequesting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            reject({
              businessId,
              message: "",
            })
          }
          disabled={isRejecting}
        >
          {isRejecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Reject
        </Button>

        <Button
          size="sm"
          onClick={() => approve({ businessId })}
          disabled={isApproving}
        >
          {isApproving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
      </div>
    </div>
  );
}
