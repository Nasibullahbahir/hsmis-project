import React, { Suspense } from "react";

// Router
import Router from "./router/Router";

// Import i18n config
import "./configs/i18n";

const App = () => {
  return (
    <Suspense fallback={null}>
      <Router />
    </Suspense>
  );
};

export default App;
