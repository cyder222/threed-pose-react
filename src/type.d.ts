interface ImportMeta {
  env: {
    [key: string]: string;
    MODE: 'development' | 'production';
    VITE_APP_TITLE: string;
  };
}

declare module '*.svg' {
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}
