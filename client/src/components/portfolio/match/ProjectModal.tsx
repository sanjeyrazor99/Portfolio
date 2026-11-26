import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { matchProjects } from "@/data/projects";
import ProjectPlay from "../ProjectPlay";

export default function ProjectModal({ index, onContinue }: {
  index: number; onContinue: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const project = matchProjects[index];
  const reduced = useReducedMotion();
  useEffect(() => {
    const panel = dialog.current;
    panel?.showModal();
    return () => { if (panel?.open) panel.close(); };
  }, []);
  return <dialog ref={dialog} className="play-match-dialog" aria-labelledby="play-match-dialog-title"
    onCancel={event => { event.preventDefault(); onContinue(); }}>
    <motion.div className="play-match-glass" initial={reduced ? false : { opacity: 0, y: 28, rotateX: -12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: .24 }}>
        <p className="play-match-eyebrow">{project.defenderZone.name} · {project.role}</p>
        <h2 id="play-match-dialog-title">{project.title}</h2>
        <p>{project.subtitle}</p>
        {project.mediaUrl ? <img src={project.mediaUrl} alt={project.title} /> :
          <figure className="play-match-preview"><ProjectPlay kind={project.kind} stages={project.stages} />
            <figcaption>{project.stages.join(" → ")}</figcaption></figure>}
        <p>{project.description}</p>
        <ul className="play-match-tags" aria-label="Technologies and project metrics">
          {[...project.techStack, ...project.metrics].map(tag => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="play-match-dialog-actions">
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live demo</a>}
          {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer">GitHub</a>}
          <button type="button" onClick={onContinue} autoFocus>Continue match</button>
        </div>
    </motion.div>
  </dialog>;
}
