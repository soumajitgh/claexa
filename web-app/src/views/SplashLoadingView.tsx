import logo from "../assets/logo/logo-light.png";

export default function SplashLoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }
          .animate-pulse-logo {
            animation: pulse 2s infinite;
          }
        `}
      </style>
      <img src={logo} alt="Loading..." className="w-32 h-32 animate-pulse-logo" />
    </div>
  );
}