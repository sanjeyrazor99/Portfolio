import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, SquarePen, Send, Check, FileText, Search, MessageSquare, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  answerPortfolio,
  topics,
  type PortfolioAnswer,
  type Topic,
} from "@/lib/portfolioChat";

interface Turn {
  id: number;
  question: string;
  answer: PortfolioAnswer;
}

export default function PortfolioChat({ children }: { children?: ReactNode }) {
  const [topicQuery, setTopicQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const visibleTopics = topics.filter(topic => (topic.title + " " + topic.question).toLowerCase().includes(topicQuery.trim().toLowerCase()));
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [visited, setVisited] = useState<Topic[]>([]);
  const [notice, setNotice] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const last = turns.at(-1);
  const suggestions = last?.answer.followups ?? [];

  function ask(value: string) {
    const text = value.trim();
    if (!text) {
      input.current?.focus();
      return;
    }
    if (text.length > 400) {
      setNotice("Keep your question under 400 characters.");
      return;
    }
    const answer = answerPortfolio(
      text,
      last?.answer.sources.map(source => source.id)
    );
    setTurns(previous => [
      ...previous.slice(-19),
      { id: Date.now(), question: text, answer },
    ]);
    if (answer.topic)
      setVisited(previous =>
        previous.includes(answer.topic!)
          ? previous
          : [...previous, answer.topic!]
      );
    setQuestion("");
    setNotice(
      answer.sources.length
        ? "Found " + answer.sources.length + " portfolio sources."
        : "No matching portfolio sources found."
    );
  }

  useEffect(() => {
    const conversation = log.current;
    if (!conversation) return;
    const latest = conversation.lastElementChild;
    conversation.scrollTop = latest && turns.length
      ? conversation.scrollTop + latest.getBoundingClientRect().top - conversation.getBoundingClientRect().top
      : 0;
  }, [turns]);

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(question);
  }

  return (
    <section className="portfolio-chat chat-workbench" data-sidebar-open={sidebarOpen} aria-labelledby="portfolio-chat-title">
      <aside className="chat-sidebar" id="chat-topic-sidebar" hidden={!sidebarOpen} aria-label="Portfolio guide topics">
        <div className="chat-header">
          <div>
            <h2 id="portfolio-chat-title">Ask about Sanjey</h2>
          </div>
          <button
            type="button"
            className="chat-reset"
            aria-label="Start a new conversation"
            title="Start over"
            onClick={() => {
              setQuestion("");
              setTurns([]);
              setVisited([]);
              setNotice("Conversation reset.");
              input.current?.focus();
            }}
          >
            <SquarePen size={18} aria-hidden="true" />
          </button>
        </div>
        <label className="chat-topic-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search topics</span>
          <input type="search" value={topicQuery} onChange={event => setTopicQuery(event.target.value)} placeholder="Search topics" />
        </label>
        <div className="chat-discovery">
          <div>
            <span>Explore by topic</span>

          </div>
          <progress
            value={visited.length}
            max={topics.length}
            aria-label="Portfolio topics explored"
          />
          <div className="chat-topic-map">
            {visibleTopics.length === 0 && <p>No matching topics.</p>}
            {visibleTopics.map(topic => (
              <button
                key={topic.id}
                type="button"
                onClick={() => ask(topic.question)}
                title={topic.question}
                aria-label={
                  topic.title +
                  (visited.includes(topic.id) ? ", explored" : ", ask a question")
                }
              >
                {visited.includes(topic.id) ? <Check size={17} aria-hidden="true" /> : <MessageSquare size={17} aria-hidden="true" />}
                {topic.title}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-contact-links">{children}</div>
      </aside>
      <div className="chat-main">
        <div className="chat-workbench-toolbar">
          <button type="button" aria-controls="chat-topic-sidebar" aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Hide topics" : "Show topics"} onClick={() => setSidebarOpen(value => !value)}>
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <span className="chat-topic-count" title="Topics explored"><span aria-hidden="true">◆</span> {visited.length}/{topics.length} explored</span>
          <img className="chat-profile" src={(import.meta.env?.BASE_URL ?? "/") + "sanjey-portrait.png"} alt="" width={30} height={30} />
        </div>
        <div
          className="chat-log" data-empty={turns.length === 0}
          ref={log}
          role="log"
          aria-label="Portfolio conversation"
          aria-live="polite"
          aria-relevant="additions"
        >
          {turns.length === 0 && (
            <div className="chat-welcome">
              <h3>What would you like to know?</h3>
              <p>Ask about my projects, experience, or technical skills.</p>
            </div>
          )}
          {turns.map(turn => (
            <div className="chat-turn" key={turn.id}>
              <p className="chat-question">
                <span>You</span>
                {turn.question}
              </p>
              <div className="chat-answer">
                <span className="chat-answer-label">Portfolio guide</span>
                <p>{turn.answer.text}</p>
                {turn.answer.sources.length > 0 && <p className="chat-source-label">Sources</p>}
                {turn.answer.sources.map((source, index) => (
                  <details
                    className="chat-source"
                    key={source.id}
                    open={index === 0}
                  >
                    <summary>
                      <FileText size={16} aria-hidden="true" />
                      {source.title}
                    </summary>
                    <p>{source.text}</p>
                    <a href={source.href}>
                      View in portfolio <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
        {suggestions.length > 0 && (
          <div className="chat-followups" role="group" aria-label="Follow-up questions">
            {suggestions.map(item => (
              <button key={item} type="button" onClick={() => ask(item)}>
                {item}
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
        <div className="chat-composer-dock">
          <form className="chat-compose" onSubmit={submit}>
            <label htmlFor="portfolio-question" className="sr-only">
              Ask a question about Sanjey's portfolio
            </label>
            <input
              id="portfolio-question"
              ref={input}
              value={question}
              onChange={event => setQuestion(event.target.value)}
              maxLength={400}
              autoComplete="off"
              placeholder="Ask about a project or role…"
              aria-describedby="chat-grounding"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Ask question"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
          <p className="chat-grounding" id="chat-grounding">
            Answers draw from this portfolio and link to their sources.
          </p>
        </div>
      </div>
      <span className="sr-only" role="status">
        {notice}
      </span>
    </section>
  );
}

