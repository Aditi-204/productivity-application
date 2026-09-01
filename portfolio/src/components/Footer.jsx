export default function Footer() {
  return (
    <footer className="bg-butter-50 px-6 pb-12 pt-4 text-center">
      <svg className="mx-auto mb-4 w-8" viewBox="0 0 40 40" aria-hidden="true">
        <path
          d="M4 8 L36 8 M20 8 L20 16 L4 16 L36 16"
          fill="none"
          stroke="#3E2D23"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="26" r="3" fill="#3E2D23" />
      </svg>
      <p className="m-0 font-hand text-base text-cocoa-500">
        drawn with glue sticks, a lil flat white &amp; too many pens — Aditi Mahajan
      </p>
      <p className="m-0 mt-1 text-sm tracking-wide text-cocoa-500/70">© {new Date().getFullYear()}</p>
    </footer>
  )
}