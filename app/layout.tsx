import "./global.css";

export const metadata = {
    title: "F1GPT",
    description: "Ask questions about F1",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
};
export default RootLayout;