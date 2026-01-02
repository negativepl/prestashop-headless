"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteAddress } from "@/app/actions/address";
import type { Address } from "@/lib/prestashop/types";

interface AddressCardProps {
  address: Address;
}

export function AddressCard({ address }: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteAddress(address.id);

    if (!result.success) {
      setError(result.error || "Wystąpił błąd");
      setIsDeleting(false);
    }
    // On success, the page will revalidate and this component will be removed
  };

  return (
    <div className="p-3 rounded-lg border text-sm relative group">
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs">
          {error}
        </div>
      )}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className="font-medium">{address.alias}</p>
          <p className="text-muted-foreground">
            {address.firstName} {address.lastName}
          </p>
          {address.company && (
            <p className="text-muted-foreground">{address.company}</p>
          )}
          <p className="text-muted-foreground">{address.address1}</p>
          {address.address2 && (
            <p className="text-muted-foreground">{address.address2}</p>
          )}
          <p className="text-muted-foreground">
            {address.postcode} {address.city}
          </p>
          <p className="text-muted-foreground">{address.country}</p>
          {(address.phone || address.phoneMobile) && (
            <p className="text-muted-foreground mt-1">
              Tel: {address.phone || address.phoneMobile}
            </p>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Usuń adres</AlertDialogTitle>
              <AlertDialogDescription>
                Czy na pewno chcesz usunąć adres &quot;{address.alias}&quot;? Tej operacji nie można cofnąć.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Usuwanie...
                  </>
                ) : (
                  "Usuń adres"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
