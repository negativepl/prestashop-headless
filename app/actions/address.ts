"use server";

import { binshops } from "@/lib/binshops/client";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function createAddress(formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const alias = formData.get("alias") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const company = formData.get("company") as string;
  const address1 = formData.get("address1") as string;
  const address2 = formData.get("address2") as string;
  const postcode = formData.get("postcode") as string;
  const city = formData.get("city") as string;
  const phone = formData.get("phone") as string;
  const countryId = parseInt(formData.get("countryId") as string) || 14; // 14 = Poland

  if (!alias || !firstName || !lastName || !address1 || !postcode || !city) {
    return { success: false, error: "Wypełnij wszystkie wymagane pola" };
  }

  try {
    const address = await binshops.createAddress({
      alias,
      firstName,
      lastName,
      company: company || undefined,
      address1,
      address2: address2 || undefined,
      postcode,
      city,
      phone: phone || undefined,
      countryId,
    });

    if (!address) {
      return { success: false, error: "Nie udało się dodać adresu" };
    }

    revalidatePath("/account");
    return { success: true, address };
  } catch (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "Wystąpił błąd podczas dodawania adresu" };
  }
}

export async function deleteAddress(addressId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  try {
    const success = await binshops.deleteAddress(addressId);

    if (!success) {
      return { success: false, error: "Nie udało się usunąć adresu" };
    }

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Wystąpił błąd podczas usuwania adresu" };
  }
}
