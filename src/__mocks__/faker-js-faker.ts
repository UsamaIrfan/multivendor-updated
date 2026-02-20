/**
 * Manual CJS-compatible mock for @faker-js/faker (ESM-only package).
 * Jest resolves this via moduleNameMapper in package.json.
 */
let counter = 0;

export const faker = {
  seed: () => {
    counter = 0;
  },
  person: {
    firstName: () => `FirstName${counter++}`,
    lastName: () => `LastName${counter++}`,
    fullName: () => `Full Name${counter++}`,
    jobTitle: () => 'Senior Teacher',
  },
  internet: {
    email: () => `user${counter++}@example.com`,
  },
  phone: {
    number: () => '+1234567890',
  },
  location: {
    streetAddress: () => '123 Fake St',
    city: () => 'Faketown',
    state: () => 'FS',
    zipCode: () => '00000',
    country: () => 'Fakeland',
  },
  lorem: {
    sentence: () => 'Fake sentence.',
    paragraph: () => 'Fake paragraph text.',
    words: () => 'fake words here',
  },
  date: {
    past: () => new Date('2024-01-01'),
    future: () => new Date('2026-01-01'),
    recent: () => new Date('2025-06-01'),
    birthdate: () => new Date('2008-05-15'),
  },
  number: {
    int: (opts?: { min?: number; max?: number }) =>
      opts?.min != null ? opts.min + 1 : 50,
    float: (opts?: { min?: number; max?: number }) =>
      opts?.min != null ? opts.min + 0.5 : 50.5,
  },
  helpers: {
    arrayElement: <T>(arr: T[]): T => arr[0],
  },
  string: {
    uuid: () => `fake-uuid-${counter++}`,
  },
  company: {
    name: () => 'Fake Corp',
  },
  finance: {
    accountNumber: () => '1234567890',
  },
};
