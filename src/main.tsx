
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const faviconUrl = new URL("./asset/checkITlogo.png", import.meta.url).href;
  const existingFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (existingFavicon) {
    existingFavicon.href = faviconUrl;
  } else {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = faviconUrl;
    document.head.appendChild(link);
  }

  createRoot(document.getElementById("root")!).render(<App />);
  