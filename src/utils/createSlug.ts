function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')          // spaces to dashes
    .replace(/-+/g, '-');          // remove duplicate dashes
}

export { createSlug };