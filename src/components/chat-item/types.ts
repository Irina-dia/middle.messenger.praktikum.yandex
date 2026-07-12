export interface ChatItemProps {
  id: number;
  title: string;
  avatarUrl: string;
  unreadCount: number;
  lastMessage: {
    author: string;
    text: string;
    time: string;
  };
}
