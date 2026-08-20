export type KitModelSpec =
  | {
      kit: "prototype";
      model: string;
      variant?: "a" | "b" | "c";
    }
  | {
      kit: "td";
      model: string;
      variant?: "a";
    }
  | {
      kit: "characters";
      model: string;
      variant?: "morty";
    };

export type PropsWithKitModel<P = unknown> = P & KitModelSpec;

export const Skins = {
  mannequin: {
    kit: "characters",
    model: "Mannequin_Medium_Animated",
  },
} satisfies Record<string, KitModelSpec>;

export const DefaultCharacterSkin: keyof typeof Skins = "mannequin";

export const AllSkins = Object.keys(Skins) as Skin[];

export type Skin = keyof typeof Skins;
