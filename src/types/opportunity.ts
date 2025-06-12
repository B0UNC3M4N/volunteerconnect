
export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  date: string;
  category: string;
  description: string;
  image_url: string | null;
  created_at: string | null;
  created_by: string;
  urgent: boolean | null;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  completion_status?: string;
  volunteer_rating?: number;
  profiles?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  volunteer_reviews?: {
    rating: number;
    comments: string | null;
  }[];
}

export interface SearchFilters {
  location?: string;
  category?: string;
  date?: string;
}

export interface VolunteerFeedback {
  id: string;
  application_id: string;
  communication_rating: number;
  organization_rating: number;
  impact_rating: number;
  comments?: string;
  created_at: string;
}

export interface VolunteerReview {
  id: string;
  application_id: string;
  rating: number;
  comments?: string;
  created_at: string;
}
