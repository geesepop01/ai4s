---
name: prompt-engineering
description: Engineer prompts for reliable LLM behavior — structure, few-shot, constraints, and evaluation. Use when an LLM's output quality depends on the prompt.
category: ml
tags: [prompting, llm, instructions, few-shot, reliability]
disable-model-invocation: true
---

# Prompt Engineering

Prompt engineering is interface design. The goal is a prompt that produces
reliable behavior across the input distribution, not one that works on the
example you tried.

## Principles

1. **Be explicit about the task, the output format, and the constraints.**
   Ambiguity is the main failure source.
2. **Show the output format** (a template or an example), not just describe it.
3. **Give examples of the hard cases**, including edge cases and what the model
   should do when it does not know.
4. **State the source of truth.** "Answer only from the provided context; if it
   is not there, say so."
5. **Put the task before the data**; and for long contexts, put the most
   important instructions where the model attends to them (beginning and end).

## Structure

```text
Role: <what the model is>
Task: <the specific job>
Input: <the data>
Constraints:
  - <rules, e.g. use only the provided sources>
Output format:
  <exact schema or template>
Examples:
  <input → output, including a hard case>
```

## Few-shot

- **Examples define the task better than instructions.** Choose them to cover
  the input space, especially the boundary cases.
- **Diverse examples** beat multiple similar ones.
- **Label the examples consistently** with the desired output format.
- **Watch for spurious pattern-matching** — vary the surface form of the
  examples.

## Constraints and reliability

- **Negative instructions** ("do not X") are weaker than positive ones ("do Y
  instead").
- **Structured output** (JSON schema, function calling) where the format must
  be machine-readable; validate it and retry on failure.
- **Chain-of-thought** for reasoning tasks; but if the final answer must be
  exact, have the model state the answer separately from the reasoning.
- **Self-consistency** (multiple samples, majority vote) for hard reasoning.

## Evaluation (essential)

- **Build a test set** of representative inputs with expected outputs.
- **Measure** the failure rate, not the vibe. Track per-category failures.
- **Ablate the prompt** — remove a section and measure. This is how you learn
  what is doing the work.
- **Robustness:** paraphrase the prompt; reword the input. A prompt that breaks
  on paraphrase is overfit.

## Versioning

The prompt is code. Version it, record the model and its settings with every
result, and treat prompt changes as experimental changes with their own
evaluation.

## Reporting

State: the exact prompt (or its version and path), the model and its version,
the decoding settings, the test set and its size, the failure rate and its
breakdown, the ablation results, and the robustness checks.

## Anti-patterns

- Tuning on the example you will report.
- No test set; a prompt approved by vibes.
- Negative constraints only.
- Prompt changes without re-evaluation.
