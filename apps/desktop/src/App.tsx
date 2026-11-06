import { ErShell } from "./components/ErShell";
import { FlashAlert } from "./components/FlashAlert";
import { LockScreen } from "./components/LockScreen";
import { RfidCatcher } from "./components/RfidCatcher";
import { ErProvider, useEr } from "./state/ErSession";

function Gate() {
  const { locked } = useEr();
  return (
    <>
      <RfidCatcher />
      {locked ? <LockScreen /> : <ErShell />}
      <FlashAlert />
    </>
  );
}

export default function App() {
  return (
    <ErProvider>
      <Gate />
    </ErProvider>
  );
}
