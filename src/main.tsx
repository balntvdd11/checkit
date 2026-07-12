
  import { createRoot } from "react-dom/client";
  import { ClerkProvider } from "@clerk/clerk-react";
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

  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

  if (!clerkPublishableKey) {
    console.error("Missing Clerk publishable key. Make sure VITE_CLERK_PUBLISHABLE_KEY is defined in checkit/.env.");
  }

  createRoot(document.getElementById("root")!).render(
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      routerPush={() => {}}
      routerReplace={() => {}}
    >
      <App />
    </ClerkProvider>
  );
  