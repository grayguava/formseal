# Changelog

All notable changes to FormSeal are documented in this file.
This project did not use formal releases prior to v2.

---

## [2.0.1] - 2026-02-07

### Security
- removed deprecated backend authentication paths related to the legacy
  browser-based admin workflow
- restricted admin authentication logic to the supported
  automation-only export flow
- added proper documentation

this release does not affect the public submission pipeline.

---

## [2.0.0] - 2026-02-03

first tagged release of FormSeal.

this marks the second-generation design of the project, including:
- a stabilized browser-side encryption pipeline
- a clarified backend trust model
- introduction of ciphertext-only export APIs
- separation of admin tooling into an external repository

earlier versions existed as untagged, experimental iterations.
