// This file tells vscode to treat .svg and .png files as strings,
// preventing errors when importing them in components.
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}
