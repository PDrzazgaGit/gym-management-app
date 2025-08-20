import React from "react";

interface CircleProps {
    deviceConnected: boolean,
    dataReady: boolean,
    cardInserted: boolean
}

export const AnimatedCircle: React.FC<CircleProps> = ({ deviceConnected, dataReady, cardInserted }) => {
    return (
        <div className="d-flex justify-content-center align-items-center">
            <div
                className="d-flex align-items-center justify-content-center text-center rounded-circle border"
                style={{
                    width: "220px",
                    height: "220px",
                    fontSize: "1.4rem",
                    fontWeight: "600",
                    backgroundColor: !deviceConnected
                        ? "var(--bs-danger-bg-subtle)"
                        : dataReady
                            ? "var(--bs-success-bg-subtle)"
                            : cardInserted
                                ? "var(--bs-warning-bg-subtle)"
                                : "var(--bs-primary-bg-subtle)"

                    ,
                    color: !deviceConnected
                        ? "var(--bs-danger)"
                        : dataReady
                            ? "var(--bs-success)"
                            : cardInserted
                                ? "var(--bs-warning)"
                                : "var(--bs-primary)",
                    animation: deviceConnected && !cardInserted ? "pulse 1.8s infinite" : (!dataReady ? "pulse 0.5s infinite" : "none"),
                }}
            >
                {!deviceConnected
                    ? "Podłącz czytnik"
                    : dataReady
                        ? "Sukces"
                        : cardInserted
                            ? "Odczyt karty"
                            : "Przyłóż kartę"}
            </div>
        </div>
    );
}