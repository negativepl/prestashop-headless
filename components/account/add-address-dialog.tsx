"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAddress } from "@/app/actions/address";

export function AddAddressDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createAddress(formData);

    setIsLoading(false);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Wystąpił błąd");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="size-4 mr-2" />
          Dodaj adres
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowy adres</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="alias">Nazwa adresu *</Label>
            <Input
              id="alias"
              name="alias"
              placeholder="np. Dom, Praca, Biuro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Jan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Kowalski"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Firma (opcjonalnie)</Label>
            <Input
              id="company"
              name="company"
              placeholder="Nazwa firmy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1">Adres *</Label>
            <Input
              id="address1"
              name="address1"
              placeholder="ul. Przykładowa 1/2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2">Adres c.d. (opcjonalnie)</Label>
            <Input
              id="address2"
              name="address2"
              placeholder="Piętro, numer mieszkania"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Kod pocztowy *</Label>
              <Input
                id="postcode"
                name="postcode"
                placeholder="00-000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Miasto *</Label>
              <Input
                id="city"
                name="city"
                placeholder="Warszawa"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+48 123 456 789"
            />
          </div>

          <input type="hidden" name="countryId" value="14" />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Anuluj
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Dodawanie...
                </>
              ) : (
                "Dodaj adres"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
