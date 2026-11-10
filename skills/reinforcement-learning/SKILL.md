---
name: reinforcement-learning
description: Apply reinforcement learning — MDPs, policy gradients, value methods, and RLHF. Use for sequential decision problems and reward optimization.
category: ml
tags: [rl, reinforcement-learning, policy-gradients, rlhf, mdp]
disable-model-invocation: true
---

# Reinforcement Learning

RL is high variance and high sensitivity to reward design. Most RL failures are
reward problems, not algorithm problems.

## The framework

```
MDP: (S, A, P, R, γ)
Objective: maximize E[Σ γ^t r_t]
```

- **The reward function is the objective.** If it is wrong, the agent optimizes
  the wrong thing — and RL is very good at finding reward loopholes.

## Methods

| Method | Type | Use |
|---|---|---|
| DQN / Rainbow | Value-based | Discrete action, off-policy |
| A2C/A3C | Policy gradient | Continuous/discrete |
| PPO | Policy gradient (clipped) | Default for stability |
| SAC / TD3 | Actor-critic, off-policy | Continuous control, sample-efficient |
| DPO | Preference-based | Alignment without a reward model |
| GRPO | Group-relative policy | LLM reasoning |

## Reward design

- **Reward shaping** changes the optimal policy; potential-based shaping
  preserves it. Use potential-based when you can.
- **Sparse vs dense rewards.** Dense is easier to learn but can be gamed.
- **Reward hacking** is the norm: the agent finds a high-reward behavior that is
  not the intent. Inspect rollouts.
- **Reward models** (RLHF) learn a proxy; validate the reward model against
  human judgments before trusting it.

## Training discipline

- **Seed variance is large.** Report the mean and spread across ≥5 seeds; a
  single run is not evidence.
- **Sample efficiency** reported (steps to threshold), not only final reward.
- **Evaluation protocol:** deterministic policy (argmax) or stochastic? Report
  it.
- **Curves with confidence bands**, not a single curve.

## Stability and diagnostics

- **Value function overestimation** (double Q, clipped double Q).
- **Entropy collapse** in policy gradients; entropy bonuses help.
- **Exploration:** ε-greedy, noise, count-based; a policy that converges
  immediately is often just exploiting.
- **Off-policy divergence** — monitor the KL/ importance ratios.

## RLHF

- **Preference data quality** is the bottleneck.
- **KL penalty** to the reference model prevents drift; report its coefficient.
- **Evaluate with held-out prompts and a judge with validity** (see
  `llm-as-judge-evaluation`).
- **Regression testing:** does alignment destroy base capabilities?

## Reporting

State: the MDP and its reward definition, the algorithm and its hyperparameters,
the seeds and the variance across them, the sample efficiency and the final
performance, the evaluation protocol, the reward-model validation (for RLHF),
and the reward-hacking inspection.

## Anti-patterns

- Reporting a single seed as the result.
- No inspection of what the policy actually does.
- Reward design iterated on the test environment.
- RLHF without reward-model validation.
