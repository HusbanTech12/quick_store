export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" className="fill-indigo-600" />
      <path
        d="M12 14h16M12 20h12M12 26h8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="30" cy="26" r="4" className="fill-violet-400" />
    </svg>
  );
}
