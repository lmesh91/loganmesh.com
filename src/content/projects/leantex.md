---
title: "LeanTeX"
status: "active"
description: "Convert proofs written in Lean 4 to natural language."
tags: ["project", "lean", "theorem-proving", "natural-language"]
featured: true
draft: false
---

![alt text](https://github.com/lmesh91/LeanTeX/raw/main/img/LeanTeX.png "LeanTeX")

[LeanTeX](https://github.com/lmesh91/LeanTeX) is a tool that converts Lean 4 programs into LaTeX documents.

> ## Warning
> LeanTeX is currently in early stages of development. Currently it is only supported for term mode proofs that use solely propositional logic and do not have any explicit input variables. Expect many bugs and issues!

Note: I am currently working on rewriting LeanTeX in Lean 4 rather than using C++, while adding support for many more types of proofs. You can see the progress of this rewrite [here](https://github.com/lmesh91/LeanTeX/tree/rewrite).