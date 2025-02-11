import { Roboto_Flex, Poppins } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  weight: ["variable"]
});

export const metadata = {
  title: "Pilot",
  description: "Made by Christian James Santos. System Automation Web App with Chatrooms, Task Management, CRM, and more features to come. Saas for VAMEPLEASE internship.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${robotoFlex.className} ${poppins.className} antialiased`}
      >
        <Nav/>
        {children}
      </body>
    </html>
  );
}
