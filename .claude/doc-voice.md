### Doc Voice

This file governs all documentation written in this project.
Read it fully before writing anything.

---

#### Purpose

This is an open source project. Documentation is written for contributors,
integrators, and users who may be encountering this codebase for the first time.
Write to help them succeed. Not to impress them.

---

#### Tone

Write as a knowledgeable peer talking to another developer.
Not a teacher lecturing. Not a product marketing page.
A person who knows the system well and wants the reader to understand it quickly.

Be direct. Be useful. Be honest about limitations.

---

#### Principles

- Lead with what something does, not why it exists.
- Prefer examples alongside or before explanations.
- Use the correct technical term consistently. Define it once, then use it.
- Write for a global audience. Avoid idioms, cultural references, and colloquialisms.
- Treat the reader as intelligent. Never explain what they did not ask about.
- If something is incomplete or unstable, say so plainly.

---

#### Sentence rules

- Short sentences. One idea per sentence.
- Active voice. "The function returns X", not "X is returned by the function".
- No wind-up openers. Start with the point.
- Vary length. Short sentences land facts. Slightly longer sentences build context.
- No hedging. If something is true, state it. If it is not always true, qualify it once.

---

#### Paragraph rules

- One idea per paragraph.
- Three sentences maximum as a general rule.
- White space is part of readability. Do not compress text to save space.

---

#### Word choices

Prefer plain words over technical-sounding ones:

| Avoid          | Use instead                  |
|----------------|------------------------------|
| utilize        | use                          |
| in order to    | to                           |
| leverage       | use, apply, build on         |
| facilitate     | help, allow, enable          |
| provide        | give, return, expose         |
| functionality  | feature, behavior, function  |
| subsequently   | then, after, next            |
| aforementioned | the, this, that (restate it) |
| respective     | remove it or rewrite         |

---

#### Hard prohibitions

Never use any of the following:

- Em-dash as a clause separator. Rewrite the sentence instead.
- Emojis or smileys of any kind, in any context.
- "Seamlessly", "robust", "powerful", "intuitive", "modern", "cutting-edge"
- "Please note that", "It is worth noting", "Note that" as sentence openers
- "Simply" or "just" before an instruction — it is condescending
- "Easy", "straightforward", "obvious"
- Rhetorical questions as section openers
- Long noun stacks ("plugin-based extensible architecture layer")
- Passive voice where active voice is possible
- Filler transitions: "Now that we have covered...", "As mentioned above..."

---

#### Structure rules

##### READMEs
1. One-line description — what it is, not what problem it solves
2. Install
3. Basic usage with a code example
4. Link to full docs

No marketing section. No badge wall at the top unless minimal.

##### Component or API documentation
1. What it is (one sentence)
2. Signature or props (code block)
3. Behavior — what it does, edge cases, defaults
4. Example (runnable if possible)
5. Notes — known limitations, related items

##### Changelogs
- Written in past tense, third person
- Group by type: Added, Changed, Fixed, Removed
- Each entry: one sentence, specific, no adjectives
- Bad: "Improved performance significantly"
- Good: "Reduced initial render time by removing redundant layout pass"

---

#### Reference bar

These projects represent the target quality level:
- Rust reference documentation
- Go standard library godoc
- Stripe API documentation
- Tailwind CSS documentation
- Linear changelog

When uncertain, ask: would this sentence appear in one of those?

---

#### Checklist before returning any documentation

- [ ] No em-dashes used anywhere
- [ ] No emojis or smileys
- [ ] No prohibited words (check the table and the hard prohibitions list)
- [ ] Every sentence says one thing
- [ ] Active voice throughout
- [ ] No condescending qualifiers (simply, just, easy, obvious)
- [ ] A reader unfamiliar with the project can follow it
- [ ] All code examples are correct and complete
