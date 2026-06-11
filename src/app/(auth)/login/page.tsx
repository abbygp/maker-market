import { Suspense } from "react";
import LoginPage from "./login-content";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-stone-500">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
