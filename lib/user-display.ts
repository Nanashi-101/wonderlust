export function fullNameOf(user: { firstName: string | null; lastName: string | null }): string | null {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}
