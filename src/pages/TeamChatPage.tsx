import React, { useState, useRef, useEffect, useCallback } from "react";
import { createSocket } from "../socket";
import {
  Send,
  Smile,
  Paperclip,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  CheckCheck,
  Plus,
} from "lucide-react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BRAND
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  active: "rgba(40,41,44,0.06)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  green: "#38A169",
  amber: "#D97706",
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "kiet_token";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CSS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const CSS = `
.tc-msg-row { animation: tcMsgIn 0.28s cubic-bezier(.4,0,.2,1) both; }
@keyframes tcMsgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes tcDot {
  0%,80%,100%{transform:scale(0.55);opacity:0.4}
  40%{transform:scale(1);opacity:1}
}
.tc-typing-dot:nth-child(1){animation-delay:0ms}
.tc-typing-dot:nth-child(2){animation-delay:160ms}
.tc-typing-dot:nth-child(3){animation-delay:320ms}
.tc-scroll::-webkit-scrollbar{width:4px}
.tc-scroll::-webkit-scrollbar-track{background:transparent}
.tc-scroll::-webkit-scrollbar-thumb{background:rgba(40,41,44,0.1);border-radius:99px}
.tc-member-row{transition:background 0.14s;cursor:pointer}
.tc-member-row:hover{background:rgba(40,41,44,0.04)!important}
.tc-bubble-own:hover .tc-ts  { opacity:1 !important; }
.tc-bubble-other:hover .tc-ts { opacity:1 !important; }
.tc-react-btn{transition:transform 0.15s,opacity 0.15s;opacity:0}
.tc-msg-row:hover .tc-react-btn{opacity:1}
.tc-react-btn:hover{transform:scale(1.2)}
.tc-send-btn{transition:background 0.15s,transform 0.13s}
.tc-send-btn:hover:not(:disabled){transform:scale(1.07)}
.tc-send-btn:disabled{opacity:0.45}
.tc-attach-btn{transition:color 0.13s}
.tc-attach-btn:hover{color:#28292C!important}
`;
function StyleInject() {
  useEffect(() => {
    if (document.getElementById("tc-style")) return;
    const el = document.createElement("style");
    el.id = "tc-style";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TYPES
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
interface Reaction {
  emoji: string;
  count: number;
  mine: boolean;
}
interface ChatMessage {
  _id: string;
  sender_id: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: Date;
  reactions: Reaction[];
  system?: boolean;
}
interface ChatMember {
  _id: string;
  name: string;
  avatar: string;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HELPERS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function namehue(name: string) {
  return (name.charCodeAt(0) * 17 + (name.charCodeAt(1) || 7) * 7) % 360;
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function Avatar({
  name,
  avatar,
  size = 34,
}: {
  name: string;
  avatar?: string;
  size?: number;
}) {
  const hue = namehue(name);
  if (avatar)
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={avatar}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue},12%,22%)`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        fontFamily: FONT,
      }}
    >
      {initials(name)}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MEMBERS SIDEBAR
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function MembersSidebar({
  members,
  teamName,
  onlineCount,
}: {
  members: ChatMember[];
  teamName: string;
  onlineCount: number;
}) {
  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: B.card,
        borderRight: `1px solid ${B.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.1rem 0.85rem",
          borderBottom: `1px solid ${B.border}`,
        }}
      >
        <p
          style={{
            fontSize: "0.85rem",
            fontWeight: 800,
            color: B.dark,
            fontFamily: FONT,
            letterSpacing: "-0.02em",
          }}
        >
          {teamName || "Team Chat"}
        </p>
        <p
          style={{
            fontSize: "0.7rem",
            color: B.muted,
            fontFamily: FONT,
            marginTop: "0.1rem",
          }}
        >
          {onlineCount > 0
            ? `${onlineCount} online`
            : `${members.length} member${members.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="tc-scroll" style={{ flex: 1, overflowY: "auto" }}>
        {members.length > 0 && (
          <div>
            <p
              style={{
                fontSize: "0.63rem",
                fontWeight: 700,
                color: B.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: FONT,
                padding: "0.85rem 1.1rem 0.35rem",
              }}
            >
              Members â€” {members.length}
            </p>
            {members.map((m) => (
              <div
                key={m._id}
                className="tc-member-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  padding: "0.6rem 1.1rem",
                }}
              >
                <Avatar name={m.name} avatar={m.avatar} size={32} />
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: B.dark,
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0.85rem", borderTop: `1px solid ${B.border}` }}>
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.55rem 0.75rem",
            borderRadius: "0.75rem",
            background: "none",
            border: `1px dashed ${B.border}`,
            color: B.muted,
            fontSize: "0.75rem",
            fontWeight: 600,
            fontFamily: FONT,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(40,41,44,0.2)";
            e.currentTarget.style.color = B.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = B.border;
            e.currentTarget.style.color = B.muted;
          }}
        >
          <Plus size={14} /> Invite Member
        </button>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TYPING INDICATOR
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label =
    names.length === 1
      ? `${names[0]} is typingâ€¦`
      : `${names.slice(0, 2).join(", ")} are typingâ€¦`;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.55rem",
        padding: "0.5rem 0",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(40,41,44,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6rem",
          fontWeight: 800,
          color: B.muted,
          fontFamily: FONT,
        }}
      >
        {names[0]?.[0] ?? "?"}
      </div>
      <div
        style={{
          padding: "0.7rem 0.9rem",
          borderRadius: "1rem 1rem 1rem 0.2rem",
          background: B.card,
          border: `1px solid ${B.border}`,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 1px 6px rgba(40,41,44,0.05)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="tc-typing-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: B.muted,
              animation: "tcDot 1.4s ease-in-out infinite",
              animationDelay: `${i * 160}ms`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: "0.68rem",
          color: B.muted,
          fontFamily: FONT,
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   REACTION PILL
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function ReactionPills({
  reactions,
  onToggle,
}: {
  reactions: Reaction[];
  onToggle: (emoji: string) => void;
}) {
  if (reactions.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: "0.3rem",
        flexWrap: "wrap",
        marginTop: "0.3rem",
      }}
    >
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.2rem 0.55rem",
            borderRadius: "999px",
            border: `1.5px solid ${r.mine ? B.dark : B.border}`,
            background: r.mine ? "rgba(40,41,44,0.07)" : B.card,
            fontSize: "0.78rem",
            cursor: "pointer",
            fontFamily: FONT,
            transition: "all 0.14s",
          }}
        >
          <span>{r.emoji}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: B.dark }}>
            {r.count}
          </span>
        </button>
      ))}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MESSAGE BUBBLE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
interface BubbleProps {
  msg: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
  onReact: (msgId: string, emoji: string) => void;
  isLast: boolean;
}
function MessageBubble({
  msg,
  isMe,
  showAvatar,
  onReact,
  isLast,
}: BubbleProps) {
  const QUICK = ["ðŸ‘", "ðŸ”¥", "â¤ï¸", "ðŸ˜‚", "ðŸŽ¯"];
  const [showActions, setShowActions] = useState(false);

  if (msg.system) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0.75rem 0",
        }}
      >
        <span
          style={{
            padding: "0.25rem 0.9rem",
            borderRadius: "999px",
            background: B.active,
            color: B.muted,
            fontSize: "0.7rem",
            fontWeight: 600,
            fontFamily: FONT,
          }}
        >
          {msg.message}
        </span>
      </div>
    );
  }

  const avatarSlot = (
    <div style={{ width: 28, flexShrink: 0 }}>
      {showAvatar && !isMe && (
        <Avatar name={msg.senderName} avatar={msg.senderAvatar} size={28} />
      )}
    </div>
  );

  return (
    <div
      className="tc-msg-row"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        display: "flex",
        flexDirection: isMe ? "row-reverse" : "row",
        gap: "0.55rem",
        alignItems: "flex-end",
        padding: "0.18rem 0",
      }}
    >
      {!isMe && avatarSlot}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isMe ? "flex-end" : "flex-start",
          maxWidth: "68%",
        }}
      >
        {showAvatar && !isMe && (
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: B.dark,
              fontFamily: FONT,
              marginBottom: "0.2rem",
              paddingLeft: "0.5rem",
            }}
          >
            {msg.senderName}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.4rem",
            flexDirection: isMe ? "row-reverse" : "row",
          }}
        >
          <div
            className={isMe ? "tc-bubble-own" : "tc-bubble-other"}
            style={{
              padding: "0.65rem 0.95rem",
              borderRadius: isMe
                ? "1.1rem 1.1rem 0.25rem 1.1rem"
                : "1.1rem 1.1rem 1.1rem 0.25rem",
              background: isMe ? B.dark : B.card,
              border: isMe ? "none" : `1px solid rgba(40,41,44,0.06)`,
              boxShadow: isMe
                ? "0 2px 8px rgba(40,41,44,0.18)"
                : "0 1px 6px rgba(40,41,44,0.05)",
              color: isMe ? "#fff" : B.dark,
              fontSize: "0.875rem",
              fontFamily: FONT,
              lineHeight: 1.55,
              wordBreak: "break-word",
              position: "relative",
            }}
          >
            {msg.message}
          </div>
          <span
            className="tc-ts"
            style={{
              fontSize: "0.62rem",
              color: B.muted,
              fontFamily: FONT,
              whiteSpace: "nowrap",
              opacity: 0,
              transition: "opacity 0.15s",
              flexShrink: 0,
              marginBottom: "0.25rem",
            }}
          >
            {fmtTime(msg.timestamp)}
          </span>
        </div>

        {isMe && isLast && (
          <div
            style={{
              marginTop: "0.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <CheckCheck size={12} style={{ color: B.green }} />
            <span
              style={{ fontSize: "0.62rem", color: B.muted, fontFamily: FONT }}
            >
              Sent
            </span>
          </div>
        )}

        <ReactionPills
          reactions={msg.reactions}
          onToggle={(emoji) => onReact(msg._id, emoji)}
        />
      </div>

      {showActions && (
        <div
          style={{
            display: "flex",
            gap: "0.2rem",
            alignItems: "center",
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "999px",
            padding: "0.25rem 0.55rem",
            boxShadow: B.shadow,
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          {QUICK.map((e) => (
            <button
              key={e}
              className="tc-react-btn"
              onClick={() => onReact(msg._id, e)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
                padding: "0.1rem",
                lineHeight: 1,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CHAT WINDOW
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  teamName: string;
  memberCount: number;
  typingNames: string[];
  onSend: (text: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}
function ChatWindow({
  messages,
  currentUserId,
  teamName,
  memberCount,
  typingNames,
  onSend,
  onReact,
  onTypingStart,
  onTypingStop,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingNames]);

  const handleSend = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput("");
    onTypingStop();
    inputRef.current?.focus();
  }, [input, onSend, onTypingStop]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (e.target.value) onTypingStart();
    else onTypingStop();
  };

  const lastOwnIdx = [...messages]
    .reverse()
    .findIndex((m) => m.sender_id === currentUserId && !m.system);
  const lastOwnId =
    lastOwnIdx >= 0 ? messages[messages.length - 1 - lastOwnIdx]._id : "";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.9rem 1.4rem",
          borderBottom: `1px solid ${B.border}`,
          background: B.card,
          flexShrink: 0,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.02em",
            }}
          >
            # {teamName || "team-chat"}
          </p>
          <p
            style={{
              fontSize: "0.7rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.1rem",
            }}
          >
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {[
            { icon: <Search size={16} />, label: "Search" },
            { icon: <Phone size={16} />, label: "Call" },
            { icon: <Video size={16} />, label: "Video" },
            { icon: <MoreHorizontal size={16} />, label: "More" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              title={label}
              style={{
                width: 34,
                height: 34,
                borderRadius: "0.6rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: B.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.13s, color 0.13s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = B.active;
                e.currentTarget.style.color = B.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = B.muted;
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div
        className="tc-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 1.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.1rem",
          background: B.bg,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "3rem",
              color: B.muted,
              fontFamily: FONT,
              fontSize: "0.82rem",
            }}
          >
            No messages yet â€” say hello! ðŸ‘‹
          </div>
        )}
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const isMe = msg.sender_id === currentUserId;
          const sameAs =
            prev &&
            prev.sender_id === msg.sender_id &&
            !msg.system &&
            !prev.system;
          return (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={isMe}
              showAvatar={!isMe && !sameAs && !msg.system}
              onReact={onReact}
              isLast={msg._id === lastOwnId}
            />
          );
        })}
        <TypingIndicator names={typingNames} />
        <div ref={endRef} />
      </div>

      <div
        style={{
          padding: "0.85rem 1.2rem",
          background: B.card,
          borderTop: `1px solid ${B.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.6rem",
            background: B.bg,
            border: `1.5px solid ${B.border}`,
            borderRadius: "999px",
            padding: "0.55rem 0.65rem 0.55rem 1rem",
            transition: "border-color 0.18s",
          }}
        >
          <button
            className="tc-attach-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: B.muted,
              display: "flex",
              padding: "0.25rem",
              flexShrink: 0,
            }}
          >
            <Paperclip size={17} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKey}
            placeholder={`Message ${teamName || "the team"}â€¦`}
            rows={1}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              resize: "none",
              fontSize: "0.875rem",
              color: B.dark,
              fontFamily: FONT,
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
              padding: "0.18rem 0",
            }}
          />
          <button
            className="tc-attach-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: B.muted,
              display: "flex",
              padding: "0.25rem",
              flexShrink: 0,
            }}
          >
            <Smile size={17} />
          </button>
          <button
            className="tc-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              background: input.trim() ? B.dark : "rgba(40,41,44,0.12)",
              border: "none",
              cursor: input.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: input.trim() ? "#fff" : B.muted,
              boxShadow: input.trim()
                ? "0 2px 8px rgba(40,41,44,0.22)"
                : "none",
              transition: "all 0.18s",
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p
          style={{
            fontSize: "0.62rem",
            color: B.muted,
            fontFamily: FONT,
            textAlign: "center",
            marginTop: "0.5rem",
          }}
        >
          Press{" "}
          <kbd
            style={{
              background: B.active,
              padding: "0 0.3rem",
              borderRadius: "0.25rem",
              fontSize: "0.62rem",
              fontFamily: "monospace",
            }}
          >
            Enter
          </kbd>{" "}
          to send &nbsp;Â·&nbsp;
          <kbd
            style={{
              background: B.active,
              padding: "0 0.3rem",
              borderRadius: "0.25rem",
              fontSize: "0.62rem",
              fontFamily: "monospace",
            }}
          >
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN PAGE EXPORT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function TeamChatPage({ teamId }: { teamId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingMap, setTypingMap] = useState<Record<string, string>>({}); // userId â†’ name

  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);
  const typingStop = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingEmit = useRef(false);

  /* â”€â”€ Initial data + socket setup â”€â”€ */
  useEffect(() => {
    if (!teamId) return;
    let alive = true;
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const init = async () => {
      try {
        const [meRes, histRes, teamRes] = await Promise.all([
          fetch(`${API}/api/users/me`, { headers }),
          fetch(`${API}/api/teams/${teamId}/messages`, { headers }),
          fetch(`${API}/api/teams/user/my-teams`, { headers }),
        ]);

        if (!alive) return;

        if (meRes.ok) {
          const u = await meRes.json();
          const user = u.data ?? u;
          setCurrentUserId(user._id ?? "");
          setCurrentUserName(user.name ?? "");
        }

        if (histRes.ok) {
          const data = await histRes.json();
          const msgs: ChatMessage[] = (data.data ?? data.messages ?? data).map(
            (m: any) => ({
              _id: m._id,
              sender_id:
                typeof m.sender_id === "object" ? m.sender_id._id : m.sender_id,
              senderName:
                typeof m.sender_id === "object"
                  ? m.sender_id.name
                  : (m.senderName ?? "Unknown"),
              senderAvatar:
                typeof m.sender_id === "object"
                  ? (m.sender_id.avatar ?? "")
                  : (m.senderAvatar ?? ""),
              message: m.message,
              timestamp: new Date(m.timestamp),
              reactions: [],
            }),
          );
          setMessages(msgs);

          // Build unique members from senders
          const seen = new Map<string, ChatMember>();
          msgs.forEach((m) => {
            if (!seen.has(m.sender_id)) {
              seen.set(m.sender_id, {
                _id: m.sender_id,
                name: m.senderName,
                avatar: m.senderAvatar,
              });
            }
          });
          setMembers(Array.from(seen.values()));
        }

        if (teamRes.ok) {
          const d = await teamRes.json();
          const list = d.data ?? d.teams ?? d;
          const t = list.find((x: any) => x._id === teamId);
          if (t) setTeamName(t.team_name ?? "");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    init();

    /* â”€â”€ Socket â”€â”€ */
    const sock = createSocket(token);
    socketRef.current = sock;

    sock.on("connect", () => {
      sock.emit("joinRoom", { teamId });
    });

    sock.on("receiveMessage", (raw: any) => {
      if (!alive) return;
      const msg: ChatMessage = {
        _id: raw._id,
        sender_id: raw.sender_id,
        senderName: raw.senderName ?? "Unknown",
        senderAvatar: raw.senderAvatar ?? "",
        message: raw.message,
        timestamp: new Date(raw.timestamp),
        reactions: [],
      };
      setMessages((prev) => {
        // Prevent duplicate if we sent it ourselves
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Add sender to members list if new
      setMembers((prev) => {
        if (prev.some((m) => m._id === msg.sender_id)) return prev;
        return [
          ...prev,
          {
            _id: msg.sender_id,
            name: msg.senderName,
            avatar: msg.senderAvatar,
          },
        ];
      });
    });

    sock.on(
      "typing:start",
      ({ userId, name }: { userId: string; name: string }) => {
        if (!alive) return;
        setTypingMap((prev) => ({ ...prev, [userId]: name }));
      },
    );

    sock.on("typing:stop", ({ userId }: { userId: string }) => {
      if (!alive) return;
      setTypingMap((prev) => {
        const n = { ...prev };
        delete n[userId];
        return n;
      });
    });

    return () => {
      alive = false;
      sock.emit("leaveRoom", { teamId });
      sock.disconnect();
      socketRef.current = null;
      if (typingStop.current) clearTimeout(typingStop.current);
    };
  }, [teamId]);

  /* â”€â”€ Send message â”€â”€ */
  const handleSend = useCallback(
    (text: string) => {
      const sock = socketRef.current;
      if (!sock || !text.trim()) return;
      sock.emit("sendMessage", { teamId, message: text.trim() });
    },
    [teamId],
  );

  /* â”€â”€ React to message (client-local only) â”€â”€ */
  const handleReact = useCallback((msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== msgId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions
              .map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.mine ? r.count - 1 : r.count + 1,
                      mine: !r.mine,
                    }
                  : r,
              )
              .filter((r) => r.count > 0),
          };
        }
        return {
          ...m,
          reactions: [...m.reactions, { emoji, count: 1, mine: true }],
        };
      }),
    );
  }, []);

  /* â”€â”€ Typing indicators â”€â”€ */
  const handleTypingStart = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    if (!isTypingEmit.current) {
      isTypingEmit.current = true;
      sock.emit("typing:start", { teamId });
    }
    if (typingStop.current) clearTimeout(typingStop.current);
    typingStop.current = setTimeout(() => {
      isTypingEmit.current = false;
      sock.emit("typing:stop", { teamId });
    }, 2000);
  }, [teamId]);

  const handleTypingStop = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    if (typingStop.current) clearTimeout(typingStop.current);
    if (isTypingEmit.current) {
      isTypingEmit.current = false;
      sock.emit("typing:stop", { teamId });
    }
  }, [teamId]);

  const typingNames = Object.entries(typingMap)
    .filter(([uid]) => uid !== currentUserId)
    .map(([, name]) => name);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          color: B.muted,
          fontFamily: FONT,
          fontSize: "0.88rem",
        }}
      >
        Loading chatâ€¦
      </div>
    );
  }

  return (
    <>
      <StyleInject />
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <h1
            style={{
              fontSize: "1.3rem",
              fontWeight: 900,
              color: B.dark,
              letterSpacing: "-0.04em",
              fontFamily: FONT,
            }}
          >
            Team Chat
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.25rem",
            }}
          >
            Real-time messaging with your team.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            height: "calc(100vh - 220px)",
            minHeight: 520,
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "1.25rem",
            boxShadow: B.shadow,
            overflow: "hidden",
          }}
        >
          <MembersSidebar
            members={members}
            teamName={teamName}
            onlineCount={0}
          />
          <ChatWindow
            messages={messages}
            currentUserId={currentUserId}
            teamName={teamName}
            memberCount={members.length}
            typingNames={typingNames}
            onSend={handleSend}
            onReact={handleReact}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
          />
        </div>
      </div>
    </>
  );
}
