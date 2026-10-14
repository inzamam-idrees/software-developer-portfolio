export const metadata = {
  title: "Portfolio administration",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminLayout({ children }) {
  return <div className="admin-surface">{children}</div>;
}
