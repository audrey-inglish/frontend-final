import { StrictMode, type ReactNode } from "react";
import { AuthProvider } from "react-oidc-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

type Props = {
  children: ReactNode;
};

const queryClient = new QueryClient();

const oidcConfig = {
  authority: "https://auth-dev.snowse.io/realms/DevRealm",
  client_id: "audrey-final",
  redirect_uri: window.location.origin + "/auth/callback",
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
};

export default function Providers({ children }: Props) {
  return (
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <StrictMode>{children}</StrictMode>
        <Toaster toastOptions={{ duration: Infinity }} />
      </QueryClientProvider>
    </AuthProvider>
  );
}
