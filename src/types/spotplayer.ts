export interface SpotPlayerLicense {
  id: string;
  user_id: string;
  course_id: string;
  license_id: string;
  license_key: string;
  is_test?: boolean;
  is_valid?: boolean;
  last_validated?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpotPlayerCookie {
  id: string;
  user_id: string;
  cookie_value: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpotPlayerStreamLog {
  id: string;
  user_id: string;
  course_id: string;
  license_key: string;
  stream_url: string;
  item_id?: string;
  accessed_at?: string;
}

export interface SpotPlayerConfig {
  courseId: string;
  itemId?: string;
  license: SpotPlayerLicense;
  cookie: SpotPlayerCookie;
}

export interface SpotPlayerExerciseData {
  spotplayer_course_id: string;
  spotplayer_item_id?: string;
  spotplayer_license_key?: string;
  auto_create_license?: boolean;
}