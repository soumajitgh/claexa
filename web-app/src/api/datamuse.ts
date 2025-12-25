// ============================================================================
// Types
// ============================================================================

// No specific types - uses external API directly

// ============================================================================
// Service
// ============================================================================

/**
 * Datamuse API service - external API, doesn't use internal client
 */
export const datamuseService = {
    /**
     * Fetch word suggestions from Datamuse "sug" endpoint.
     * Docs: https://www.datamuse.com/api/
     */
    async suggest(query: string, max: number = 8, signal?: AbortSignal): Promise<string[]> {
        const q = query.trim();
        if (!q) return [];

        const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=${max}`;
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`Datamuse error: ${res.status}`);
        const data: Array<{ word: string; score: number }> = await res.json();

        // Deduplicate and drop falsy
        const words = data.map((d) => d.word).filter(Boolean) as string[];
        return Array.from(new Set(words));
    },
};
