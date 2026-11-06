import { LoginScreen } from "./components/LoginScreen";
import { ErShell } from "./components/ErShell";
import { ErProvider, useEr } from "./state/ErSession";

function Gate() {
  const { session } = useEr();
  return session ? <ErShell /> : <LoginScreen />;
}

export default function App() {
  return (
    <ErProvider>
      <Gate />
    </ErProvider>
  );
}
