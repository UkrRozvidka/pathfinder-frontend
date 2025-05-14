export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface AuthDTO {
  userName: string;
  password: string;
}

export interface HikeCreateDTO {
  name: string;
  maxDistanceKm: number;
  startPoint: GeoPoint;
  endPoint: GeoPoint;
}

export interface HikeGetDTO {
  id: number;
  name: string;
  adminId: number;
  maxDistanceKm: number;
  startPoint: GeoPoint;
  endPoint: GeoPoint;
}

export interface HikeGetFullDTO extends HikeGetDTO {
  adminName: string;
  hikeMembers: HikeMemberGetFullDTO[];
  tracks: TrackGetDTO[];
}

export interface HikeMemberCreateDTO {
  userName: string;
  hikeId: number;
}

export interface HikeMemberGetFullDTO {
  id: number;
  userId: number;
  userName: string;
  hikeId: number;
  hikeName: string;
  points: PointGetDTO[];
}

export interface PointCreateDTO {
  geoPoint: GeoPoint;
  priority: number;
  hikeId: number;
}

export interface PointUpdateDTO {
  geoPoint: GeoPoint;
  priority: number;
}

export interface PointGetDTO {
  id: number;
  geoPoint: GeoPoint;
  priority: number;
  hikeMemberId: number;
}

export interface TrackCreateDTO {
  hikeId: number;
  fileName: string;
}

export interface TrackGetDTO extends TrackCreateDTO {
  id: number;
  gpxFile: string;
}

export interface UserGetDTO {
  id: number;
  userName: string;
} 