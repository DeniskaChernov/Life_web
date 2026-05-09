import { LoginForm } from "./login-form";

export default function LoginPage() {
  const showGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);
  return <LoginForm showGoogle={showGoogle} />;
}
