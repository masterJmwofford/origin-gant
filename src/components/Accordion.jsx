import { useState } from "react";

export default function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="accordion">
      <button
        className="accordion-header"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="accordion-content">{children}</div>}
    </article>
  );
}
