export const metadata = {
  title: {
    template: "%s · Portfolio admin",
    default: "Portfolio admin",
  },
  description: "Private administration for the portfolio site.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({ children }) {
  return <div className="admin-surface">{children}</div>;
}
