# Changelog

Notable project changes are documented here.

## [1.0.0] - 2026-11-06

### Added
- Motion Lab responsive interface.
- Four selectable PSF motion approximations.
- Motion length, angle and Wiener strength controls.
- FastAPI image restoration endpoint and WEBP result retrieval.
- Vercel ASGI deployment configuration.
- GitHub Actions smoke-check workflow.
- Project documentation and contribution guidance.

### Notes
- Restoration is model-based and uses a user-supplied PSF prior.
- Generated files use temporary local storage in serverless deployments.
