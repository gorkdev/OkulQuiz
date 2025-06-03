import { __DEV__ } from "./config/env";

function App() {
  return (
    <>
      <h1 className="text-2xl text-red-500">
        {__DEV__ ? "Development" : "Production"}
      </h1>
    </>
  );
}

export default App;
