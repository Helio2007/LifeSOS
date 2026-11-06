import { useState, type FormEvent } from "react";
import { useEr } from "../state/ErSession";

export function LoginScreen() {
  const { login, loginError, busy } = useEr();
  const [username, setUsername] = useState("er.staff");
  const [password, setPassword] = useState("lifesos");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void login(username, password).catch(() => undefined);
  };

  return (
    <div className="login">
      <div className="login__panel">
        <p className="eyebrow">LifeSOS · ER Terminal</p>
        <h1>Staff session</h1>
        <p className="lede">
          Identify the desk, then unlock clinical actions with an RFID card.
          Mock API is in-process — Spring Boot is not required for this demo.
        </p>
        <form onSubmit={onSubmit} className="login__form">
          <label>
            Username
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {loginError ? <p className="error">{loginError}</p> : null}
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Signing in…" : "Open ER desk"}
          </button>
        </form>
        <p className="hint">Demo login is prefilled: er.staff / lifesos</p>
      </div>
    </div>
  );
}
