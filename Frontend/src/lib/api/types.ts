export type UserRole = "ADMIN" | "EDITOR" | "USER";

export interface ApiEnvelope<T> {
  is_successful?: boolean;
  success?: boolean;
  message?: string;
  data: T;
}

export interface CategoryRecord {
  id: number;
  name: string;
}

export interface CategoryDetailRecord extends CategoryRecord {
  article: string;
}

export interface ActiveArticleRecord {
  article_id: number;
  content: string;
}

export interface ArticleRecord {
  id: number;
  peripheral_id: number;
  version_number: number;
  content: string;
  is_active: boolean;
  created_at: string;
  author_username: string;
  author_image_url: string | null;
  average_rating: number | string;
  total_ratings: number;
}

export interface ArticleVersionRecord {
  id: number;
  version_number: number;
  is_active: boolean;
  created_at: string;
  created_by: number;
}

/** Exact object returned by GET /comment/{article_id}. */
export interface CommentApiRecord {
  comment_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  author_id: number;
  author_username: string;
  author_name: string;
  upvotes: number | string;
  downvotes: number | string;
}

/** Normalized shape used by the React comment tree. */
export interface CommentRecord {
  id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  author_id: number;
  author_username: string;
  author_name: string;
  upvotes: number;
  downvotes: number;
}

export interface CommentNode extends CommentRecord {
  replies: CommentNode[];
}

export interface ProfileRecord {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  image_id: number | null;
  image_url: string | null;
  image_public_id: string | null;
}

export interface UserRecord {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  image_url: string | null;
}

export interface EditorRequestRecord {
  application_id: number;
  note: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  user_id: number;
  name: string;
  username: string;
  email: string;
}

export interface ReportRecord {
  report_id: number;
  note: string | null;
  status: "PENDING" | "RESOLVED";
  created_at: string;
  reviewed_at: string | null;
  reporter_id: number;
  reporter_username: string | null;
  reported_user_id: number;
  reported_username: string | null;
  comment_id: number;
  comment_content: string | null;
  reviewed_by: number | null;
  reviewer_username: string | null;
}

export interface UploadImageResponse {
  url: string;
  public_id: string;
}

export interface BackendErrorPayload {
  detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
  message?: string;
}
