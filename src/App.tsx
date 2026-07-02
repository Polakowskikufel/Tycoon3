import { Toaster } from "sonner";
import Game from "./pages/Game";

function App() {
  return (
    <>
      <Game />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(230 18% 12%)",
            border: "1px solid hsl(230 15% 18%)",
            color: "hsl(230 10% 92%)",
          },
        }}
      />
    </>
  );
}

export default App;
