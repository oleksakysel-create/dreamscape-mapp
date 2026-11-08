export interface Palette {
  id: string;
  name: string;
  colors: readonly string[];
}

export const PALETTES: readonly Palette[] = [
  { id: "dawn", name: "Warm Dawn", colors: ["#FBE3D3", "#F6C6A8", "#EFA48B", "#E07A5F", "#C65D47", "#F5CD8E", "#E9B949", "#D98E3A", "#FADDE1", "#D96C8A"] },
  { id: "forest", name: "Forest Walk", colors: ["#E4EBD9", "#C7D6B3", "#9DB98A", "#7D9B76", "#5B8E7D", "#3F6B5C", "#A3B18A", "#DAD7CD", "#8A6E4B", "#5C4433"] },
  { id: "ocean", name: "Still Water", colors: ["#E6F2F5", "#B5D2E3", "#8FBCD4", "#4F86A6", "#2F5D7C", "#A9DAD1", "#6DB5A8", "#3C8C82", "#F2EAD3", "#1E3A4C"] },
  { id: "dusk", name: "Lavender Dusk", colors: ["#F1ECF7", "#E3DDF0", "#C3B6DD", "#9C89B8", "#7A6FA8", "#584C86", "#F4B6C2", "#F0A6CA", "#B8BEDD", "#2E2A4F"] },
];

export const DEFAULT_COLOR = PALETTES[0]!.colors[2]!;
