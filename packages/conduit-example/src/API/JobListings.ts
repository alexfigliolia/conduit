import type { JobListingResponse } from "./types";

export class JobListings {
  public static readonly URL = `https://jsearch.p.rapidapi.com/search-v2?num_pages=1&country=us&date_posted=all`;
  public static async fetch(search: string, cursor?: string) {
    if (!search) {
      return;
    }
    const response = await fetch(this.format(search, cursor), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": "e0bae674edmsh194b9ae479a120dp15bf92jsn712788afc276",
      },
    });
    const result = await response.json();
    return result.data as JobListingResponse;
  }

  private static format(search: string, cursor?: string) {
    let URL = `${this.URL}&query=${search}`;
    if (cursor !== undefined) {
      URL = `${URL}&cursor=${cursor}`;
    }
    return URL;
  }
}
