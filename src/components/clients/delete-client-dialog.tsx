"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClientAction } from "@/lib/actions/clients.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

export function DeleteClientDialog({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deleteClientAction(id);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${name} deleted`);
    router.push("/clients");
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={buttonVariants({ variant: "outline" })}
        onClick={(event) => event.stopPropagation()}
      >
        <Trash2 className="size-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the client along with all measurements, orders and payment
            history. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete client
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
