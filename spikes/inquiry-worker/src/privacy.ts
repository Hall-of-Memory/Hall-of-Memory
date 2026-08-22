interface NotificationReference {
  event_date: string;
  id: string;
  offer_id: string;
}

export async function actorRateLimitKey(offerId: string, email: string): Promise<string> {
  const normalized = `${offerId}:${email.trim().toLowerCase()}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return `inquiry:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function ownerNotificationText(row: NotificationReference): string {
  return [
    'Neue Anfrage über Hall of Memory', '', `Angebot: ${row.offer_id}`,
    `Veranstaltungsdatum: ${row.event_date}`, `Anfrage-ID: ${row.id}`, '',
    'Kontaktdaten und Nachricht sind ausschließlich im geschützten Adminbereich einsehbar.',
  ].join('\n');
}
