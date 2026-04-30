export type Album = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_public_id: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  album_id: string;
  cloudinary_public_id: string;
  width: number;
  height: number;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type AlbumWithPhotos = Album & { photos: Photo[] };

export type AlbumWithCounts = Album & { photo_count: number };
