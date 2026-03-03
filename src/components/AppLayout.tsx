import type { ReactNode } from "react";

interface AppLayoutProps {
  toolbar: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  inspector: ReactNode;
}

export function AppLayout({ toolbar, sidebar, content, inspector }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="toolbar-shell">{toolbar}</header>
      <aside className="sidebar-shell">{sidebar}</aside>
      <main className="content-shell">{content}</main>
      <section className="inspector-shell">{inspector}</section>
    </div>
  );
}
