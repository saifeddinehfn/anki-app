
export const metadata = {
  title: "Anki App",
  description: "Learn smarter, remember longer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
