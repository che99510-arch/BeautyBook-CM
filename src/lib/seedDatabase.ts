// Database seeding has been moved to Django backend
// This file is disabled - seed data is now managed via Django migrations

export async function seedDatabaseIfEmpty(): Promise<boolean> {
  // No-op - seeding is now handled by Django backend
  console.log('Database seeding is handled by Django backend');
  return false;
}
