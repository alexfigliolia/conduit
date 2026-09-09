export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface JobListingResponse {
  cursor?: string;
  jobs: JobListing[];
}

export interface JobListing {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_description: string;
  employer_logo: string;
  job_city: string;
  job_state: string;
  job_country: string;
  employer_website: string;
  job_apply_link: string;
}
