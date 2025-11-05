import Providers from "@/components/Providers";
import { ReportIssueButton } from "@/components/issues";
import "@/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ReportIssueButton />
        </Providers>
      </body>
    </html>
  );
} 