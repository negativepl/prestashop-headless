"use server";

import { prestashop } from "@/lib/prestashop/client";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email jest wymagany" };
  }

  try {
    const success = await prestashop.updateCustomer(session.customerId, {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
    });

    if (!success) {
      return { success: false, error: "Nie udało się zaktualizować danych" };
    }

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Wystąpił błąd podczas aktualizacji danych" };
  }
}

export async function changePassword(formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Wypełnij wszystkie pola" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Nowe hasło musi mieć minimum 8 znaków" };
  }

  try {
    // First verify current password by trying to login
    const loginResult = await prestashop.loginCustomer(session.email, currentPassword);

    if (!loginResult) {
      return { success: false, error: "Aktualne hasło jest nieprawidłowe" };
    }

    // Update password
    const success = await prestashop.updateCustomerPassword(session.customerId, newPassword);

    if (!success) {
      return { success: false, error: "Nie udało się zmienić hasła" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Wystąpił błąd podczas zmiany hasła" };
  }
}
