export interface SiteConfig {
  title: string;
  subtitle: string;
}

export interface Program {
  time: string;
  title: string;
  description?: string;
}

export interface Channel {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  category: string;
  isLive: boolean;
  url: string;
  description?: string;
  epg?: Program[];
}
