import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import "../styles/app-loader.css";

const AppLoader = () => {
  const [isSlow, setIsSlow] = useState(false);

  // Render free tier cold start: 4 sec se zyada lage to hint dikhao
  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="app-loader-spinner">
        <span className="app-loader-ring" aria-hidden="true" />
        <img
          src="/icon.png"
          alt=""
          className="app-loader-logo-img"
          aria-hidden="true"
        />
      </div>

      <p className="app-loader-title">Stack – Read and write stories that matter</p>

      <p className="app-loader-text">
        {isSlow
          ? "Server is Loading Please wait..."
          : " Server Load ho raha hai..."}
      </p>

      {isSlow && (
        <div className="app-loader-bar" aria-hidden="true">
          <span />
        </div>
      )}
    </div>
  );
};

export default AppLoader;
