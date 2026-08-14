import { AppShell } from '../components/layout/AppShell';
import { ChatWindow } from '../components/chat/ChatWindow';
import './ChatPage.css';

export function ChatPage() {
  return (
    <AppShell sinPadding>
      <div className="chat-pagina">
        <ChatWindow />
      </div>
    </AppShell>
  );
}
