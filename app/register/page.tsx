"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, AlertCircle, CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gender, setGender] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Add gender from state (Select doesn't use native form data)
    if (gender) {
      formData.set("gender", gender);
    }
    // Add birthday from state if all parts are filled
    if (birthDay && birthMonth && birthYear) {
      formData.set("birthday", `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`);
    }
    const result = await registerUser(formData);

    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      setError(result.error || "Wystąpił błąd podczas rejestracji");
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Konto utworzone!</h1>
          <p className="text-muted-foreground mt-2">
            Za chwilę zostaniesz przekierowany na stronę główną...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Stwórz konto</h1>
          <p className="text-muted-foreground mt-2">
            Dołącz do nas i korzystaj z pełni możliwości
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Jan"
                  className="pl-10 h-12 bg-white dark:bg-neutral-900"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Kowalski"
                className="h-12 bg-white dark:bg-neutral-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="twoj@email.pl"
                className="pl-10 h-12 bg-white dark:bg-neutral-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 znaków"
                className="pl-10 pr-10 h-12 bg-white dark:bg-neutral-900"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Powtórz hasło"
                className="pl-10 pr-10 h-12 bg-white dark:bg-neutral-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {/* Optional fields */}
          <div className="space-y-2">
            <Label htmlFor="gender">Płeć <span className="text-muted-foreground text-xs">(opcjonalne)</span></Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-full !h-12 bg-white dark:bg-neutral-900">
                <SelectValue placeholder="Wybierz płeć..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Mężczyzna</SelectItem>
                <SelectItem value="2">Kobieta</SelectItem>
                <SelectItem value="0">Wolę nie podawać</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data urodzenia <span className="text-muted-foreground text-xs">(opcjonalne)</span></Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={birthDay} onValueChange={setBirthDay}>
                <SelectTrigger className="w-full !h-12 bg-white dark:bg-neutral-900">
                  <SelectValue placeholder="Dzień" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={birthMonth} onValueChange={setBirthMonth}>
                <SelectTrigger className="w-full !h-12 bg-white dark:bg-neutral-900">
                  <SelectValue placeholder="Miesiąc" />
                </SelectTrigger>
                <SelectContent>
                  {["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"].map((month, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={birthYear} onValueChange={setBirthYear}>
                <SelectTrigger className="w-full !h-12 bg-white dark:bg-neutral-900">
                  <SelectValue placeholder="Rok" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: new Date().getFullYear() - 1939 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Newsletter with discount incentive */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="newsletter"
                name="newsletter"
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="newsletter" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Gift className="size-4 text-primary" />
                  Zapisz się do newslettera
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Odbierz <span className="font-semibold text-primary">15% rabatu</span> na pierwsze zakupy!
                  Bądź na bieżąco z nowościami i ekskluzywnymi promocjami.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms"
              name="terms"
              required
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed cursor-pointer">
              Akceptuję{" "}
              <Link href="/terms" className="text-primary hover:underline">
                regulamin
              </Link>{" "}
              oraz{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                politykę prywatności
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
            {!isLoading && <ArrowRight className="ml-2 size-4" />}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-muted-foreground">lub kontynuuj przez</span>
          </div>
        </div>

        {/* Social login */}
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline" size="icon" className="h-12 w-full" type="button" disabled>
            <svg className="size-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </Button>

          <Button variant="outline" size="icon" className="h-12 w-full" type="button" disabled>
            <svg className="size-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </Button>

          <Button variant="outline" size="icon" className="h-12 w-full" type="button" disabled>
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </Button>

          <Button variant="outline" size="icon" className="h-12 w-full" type="button" disabled>
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </Button>
        </div>

        {/* Login link */}
        <p className="text-center mt-8 text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
