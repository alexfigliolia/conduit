export class Geocoding {
  public static readonly API_KEY = import.meta.env.VITE_GEO_API_KEY as string;
  public static readonly URL = `https://geocode.maps.co/search?api_key=${this.API_KEY}`;

  public static async fetch(query: string) {
    if (!query) {
      return [];
    }
    const URL = `${this.URL}&q=${encodeURIComponent(query)}`;
    const response = await fetch(URL);
    const result = await response.json();
    return result as PlaceSuggestion[];
  }
}

export interface PlaceSuggestion {
  display_name: string;
  lat: number;
  lon: number;
}
