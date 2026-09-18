import type { MapObjective } from "@/app/lib/knowledge-map-types";

export type LearningPeer = {
  id: string;
  name: string;
  avatar: string;
  avatarClass: string;
  presence: string;
  preview: string;
};

const avatarTones = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

const peers = [
  "Mai Hoa", "Minh Anh", "Tuấn Kiệt", "Ngọc Lan", "Bảo Trâm",
  "Gia Huy", "Khánh Linh", "Đức Anh", "Thảo My", "Quang Huy",
  "Phương Nhi", "Hoàng Nam", "Yến Nhi", "Thanh Tùng", "Kim Ngân",
  "Hải Đăng", "Linh Chi", "Bảo Long", "Thu Hà", "Nhật Minh",
];

/** Assigns a stable, named learning peer to each knowledge-tree objective. */
export function peerForObjective(objective: MapObjective | undefined): LearningPeer {
  const title = objective?.title ?? "chủ đề này";
  const score = [...title].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const name = peers[score % peers.length];
  const avatar = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return {
    id: objective?.id ?? "unselected",
    name,
    avatar,
    avatarClass: avatarTones[score % avatarTones.length],
    presence: `${name} đang chờ bạn giúp`,
    preview: `${name} muốn hiểu: ${title}`,
  };
}
