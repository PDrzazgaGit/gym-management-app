import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TrainingProvider } from "./react-context/TrainingProvider";
import { AcrProvider } from "./react-context/AcrProvider";
import { BouncingPapaj } from "./components/BouncingPapaj";

export const App = () => {
  const sideBar = 250;
  const [papajVisible, setPapajVisible] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState<string>(""); // pamięć ostatnich wpisanych klawiszy

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // dodajemy nowy znak do bufora
      const newBuffer = (keyBuffer + e.key).slice(-4); // trzymamy ostatnie 4 znaki
      setKeyBuffer(newBuffer);

      if (newBuffer === "2137") {
        setPapajVisible((prev) => !prev); // przełączamy widoczność Papaja
        setKeyBuffer(""); // reset bufora po odpaleniu
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keyBuffer]);

  return (
    <div className="d-flex p-0 m-0">
      <Sidebar width={sideBar} />
      <div className="flex-grow-1 p-0 m-0 position-relative">
        {/* Bouncing Papaj pojawia się tylko gdy papajVisible = true */}
        {papajVisible && <BouncingPapaj />}

        <AcrProvider>
          <TrainingProvider>
            <Outlet />
          </TrainingProvider>
        </AcrProvider>
      </div>
    </div>
  );
};
