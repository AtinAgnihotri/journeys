# Antigravity Notes

Add `skills/journeys/SKILL.md` to your Antigravity workspace rules or project
context so the agent loads Journeys schema and integration constraints before
editing workflow JSON.

Recommended activation prompt:

```text
Read skills/journeys/SKILL.md from this repository. Use @journeys/core when
installed. Preserve schemaVersion "1.0", validate workflow JSON changes, and
do not invent an expression DSL or eval-based conditions.
```

Canonical instructions: [../SKILL.md](../SKILL.md).
