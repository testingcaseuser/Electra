"use server";

import { removeUserFromSpace } from "@/services/space";
import { revalidatePath, revalidateTag } from "next/cache";

export async function leaveSpace(formData: FormData) {
  const userId = formData.get("userid") as string;
  const spaceId = formData.get("spaceid") as string;
  const movieId = formData.get("movieid") as string;

  if (!userId || !spaceId || !movieId) return;

  try {
    await removeUserFromSpace(userId, spaceId, movieId);
    revalidateTag(`userspaces:${userId}`);
    revalidatePath("/movies/space");
  } catch (error) {
    console.error("Failed to leave space:", error);
  }
}
