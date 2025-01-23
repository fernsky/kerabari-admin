// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { api } from "@/trpc/react";
// import { useState } from "react";

// interface FamilyActionsProps {
//   familyId: string;
//   currentStatus: "pending" | "approved" | "rejected" | "requested_for_edit";
//   onStatusChange: () => void;
// }

// export function FamilyActions({
//   familyId,
//   currentStatus,
//   onStatusChange,
// }: FamilyActionsProps) {
//   const [message, setMessage] = useState("");
//   const [open, setOpen] = useState(false);

//   const { mutate: updateStatus } = api.family.updateStatus.useMutation({
//     onSuccess: () => {
//       onStatusChange();
//       setOpen(false);
//     },
//   });

//   const { mutate: requestEdit } = api.family.requestEdit.useMutation({
//     onSuccess: () => {
//       onStatusChange();
//       setOpen(false);
//       setMessage("");
//     },
//   });

//   return (
//     <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//           <Button
//             variant="outline"
//             disabled={currentStatus === "requested_for_edit"}
//           >
//             Request Edit
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Request Edit</DialogTitle>
//           </DialogHeader>
//           <Textarea
//             placeholder="Enter reason for edit request..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
//           <DialogFooter>
//             <Button
//               onClick={() => requestEdit({ familyId, message })}
//               disabled={!message}
//             >
//               Submit Request
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Button
//         variant={currentStatus === "approved" ? "outline" : "default"}
//         onClick={() => updateStatus({ familyId, status: "approved" })}
//         disabled={currentStatus === "approved"}
//       >
//         Approve
//       </Button>

//       <Button
//         variant={currentStatus === "rejected" ? "outline" : "destructive"}
//         onClick={() => updateStatus({ familyId, status: "rejected" })}
//         disabled={currentStatus === "rejected"}
//       >
//         Reject
//       </Button>
//     </div>
//   );
// }
