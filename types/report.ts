export type Emotion = 'SCARY' | 'ANNOYING' | 'FUNNY';

export interface Report {
  reportId: string;
  emotion: Emotion;
  title: string;
  content: string;
  location: string;
  latitude: number;   // 위도 필드 추가
  longitude: number;  // 경도 필드 추가
  timeAgo: string;
  likes: number;
  isLike?: boolean;  // 로그인한 사용자의 좋아요 여부
  isHot?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
} 