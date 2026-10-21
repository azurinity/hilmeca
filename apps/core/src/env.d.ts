// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Global CSS
declare module '*.css';

// Image formats
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ico';

// Font formats
declare module '*.ttf';
declare module '*.otf';
declare module '*.woff';
declare module '*.woff2';
declare module '*.eot';
