declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "howler" {
  export const Howl: any;
  export const Howler: {
    autoSuspend: boolean;
  };
}
