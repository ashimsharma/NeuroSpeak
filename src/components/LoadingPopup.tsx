import { useEffect, useState } from "react";

type LoadingPopupProps = {
  show: boolean;
  message?: string;
  duration?: number; 
};

export default function LoadingPopup({
  show,
  message = "Translating...",
  duration,
}: LoadingPopupProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);

    if (show && duration) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  return (
    <>
      {visible && (
        <div
          className={`fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg transition-transform transform ${
            visible ? "translate-y-0" : "translate-y-20"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>{message}</span>
          </div>
        </div>
      )}
    </>
  );
}
