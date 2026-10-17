import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconMessageCircle } from "@tabler/icons-react";
import type { SocialIcon as SocialIconName } from "@/data/boongee";

const ICONS = {
  facebook: IconBrandFacebook,
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  zalo: IconMessageCircle,
} as const;

export function SocialIcon({ name, className = "size-5" }: { name: SocialIconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden className={className} />;
}
