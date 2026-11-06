import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, RotateCcw, Send, Check, Compass } from "lucide-react";
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

export default function PortfolioChat() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [visited, setVisited] = useState<Topic[]>([]);
  const [notice, setNotice] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const last = turns.at(-1);
  const suggestions =
    last?.answer.followups ?? topics.slice(0, 3).map(topic => topic.question);

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
    requestAnimationFrame(() => {
      if (log.current) log.current.scrollTop = log.current.scrollHeight;
    });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    ask(question);
  }

  return (
    <section className="portfolio-chat" aria-labelledby="portfolio-chat-title">
      <div className="chat-header">
        <div>
          <span className="chat-eyebrow">INTERACTIVE PORTFOLIO</span>
          <h3 id="portfolio-chat-title">Ask about Sanjey</h3>
        </div>
        <button
          type="button"
          className="chat-reset"
          aria-label="Start a new conversation"
          title="Start over"
          onClick={() => {
            setTurns([]);
            setVisited([]);
            setNotice("Conversation reset.");
            input.current?.focus();
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="chat-discovery">
        <div>
          <span>DISCOVERY PROGRESS</span>
          <strong>
            {visited.length} / {topics.length} topics
          </strong>
        </div>
        <progress
          value={visited.length}
          max={topics.length}
          aria-label="Portfolio topics explored"
        />
        <div className="chat-topic-map">
          {topics.map((topic, index) => (
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
              <span className={visited.includes(topic.id) ? "discovered" : ""}>
                {visited.includes(topic.id) ? (
                  <Check size={12} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              {topic.title}
            </button>
          ))}
        </div>
      </div>
      <div
        className="chat-log"
        ref={log}
        role="log"
        aria-label="Portfolio conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {!turns.length && (
          <div className="chat-welcome">
            <Compass size={28} />
            <h4>Pick a topic. Follow your curiosity.</h4>
            <p>
              Explore the defense pipeline, AI projects, research, or Sanjey's
              background. Each answer includes the portfolio sources behind it.
            </p>
            <span>Start with a suggested question or type your own.</span>
          </div>
        )}
        {turns.map(turn => (
          <div className="chat-turn" key={turn.id}>
            <p className="chat-question">
              <span>You</span>
              {turn.question}
            </p>
            <div className="chat-answer">
              <span className="chat-answer-label">PORTFOLIO GUIDE</span>
              <p>{turn.answer.text}</p>
              {turn.answer.sources.map((source, index) => (
                <details
                  className="chat-source"
                  key={source.id}
                  open={index === 0}
                >
                  <summary>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {source.title}
                  </summary>
                  <p>{source.text}</p>
                  <a href={source.href}>
                    View in portfolio <ArrowUpRight size={13} />
                  </a>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-followups" aria-label="Suggested questions">
        {suggestions.map(item => (
          <button key={item} type="button" onClick={() => ask(item)}>
            {item}
            <ArrowUpRight size={12} />
          </button>
        ))}
      </div>
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
          placeholder="Ask about a project, role, or technology…"
          aria-describedby="chat-grounding"
        />
        <button
          type="submit"
          disabled={!question.trim()}
          aria-label="Ask question"
        >
          <Send size={17} />
        </button>
      </form>
      <p className="chat-grounding" id="chat-grounding">
        Answers use published portfolio excerpts. Unlisted details stay
        unanswered.
      </p>
      <span className="sr-only" role="status">
        {notice}
      </span>
    </section>
  );
}

