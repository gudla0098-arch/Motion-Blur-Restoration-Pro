<div align="center">

# Motion Blur Restoration Pro

### A Digital Image Processing Lab for Model-Based Motion Blur Restoration

[![CI](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro/actions/workflows/smoke-check.yml/badge.svg?branch=main)](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro/actions/workflows/smoke-check.yml)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Model · Restore · Compare · Learn**

[Live Demo](https://motion-blur-restoration-pro-raju-d9aa.vercel.app) · [Documentation](docs/ARCHITECTURE.md) · [Report a Bug](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro/issues/new/choose)

</div>

---

## Overview

Motion blur appears when a camera or subject moves while an image is being exposed. **Motion Blur Restoration Pro** is an interactive learning and experimentation tool that models this blur with a point-spread function (PSF), then attempts to recover image detail using frequency-domain Wiener deconvolution.

Choose an approximate motion model, tune its parameters, process an image, and compare the result with the original.

> **Scientific scope:** This is model-based restoration using a user-selected PSF prior. It does not automatically estimate an unknown blur kernel (blind deconvolution).

## Key features

| Feature | Description |
|---|---|
| Interactive workspace | Responsive dark interface for image upload, model selection and processing |
| Four motion models | Linear, circular, uniform and non-uniform PSF approximations |
| Parameter controls | Motion length, angle and Wiener regularization strength |
| Restoration engine | NumPy FFT-based Wiener deconvolution across RGB channels |
| Result comparison | Original and restored image previews |
| Export | Download the restored image as WEBP |
| API | FastAPI endpoints for processing, health checks and result retrieval |
| Automated checks | GitHub Actions smoke tests for syntax, routes and image-processing functions |

## How it works

```text
       INPUT IMAGE
            |
            v
   SELECT MOTION MODEL
            |
            v
  SET LENGTH / ANGLE / STRENGTH
            |
            v
    CONSTRUCT PSF KERNEL
            |
            v
   WIENER DECONVOLUTION
            |
            v
  PREVIEW  -->  COMPARE  -->  DOWNLOAD
```

### Supported motion models

| Model | What it approximates |
|---|---|
| **Linear** | Directional straight-line movement with weighted samples |
| **Circular** | Rotational movement around an approximate centre |
| **Uniform** | Straight-line movement with constant kernel weights |
| **Non-uniform** | A curved trajectory with changing direction |

## Technology stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Python 3.12, FastAPI
- **Image processing:** NumPy, Pillow, FFT and Wiener filtering
- **Deployment:** Vercel
- **CI:** GitHub Actions

## Project structure

```text
Motion-Blur-Restoration-Pro/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug and feature request forms
│   ├── workflows/               # Automated CI checks
│   └── PULL_REQUEST_TEMPLATE.md
├── api/
│   └── index.py                 # Vercel ASGI entry point
├── backend/
│   └── main.py                  # FastAPI routes and restoration engine
├── docs/
│   └── ARCHITECTURE.md          # System design and processing details
├── motion-blur.html             # Main application interface
├── motion-blur.css              # Workspace styles
├── motion-blur.js               # Browser interactions and API calls
├── styles.css                   # Shared design foundation
├── requirements.txt             # Python dependencies
├── vercel.json                  # Vercel configuration
├── CHANGELOG.md
├── CITATION.cff
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── SECURITY.md
```

## Quick start

### Requirements

- Python 3.12
- Git

### 1. Clone the repository

```bash
git clone https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro.git
cd Motion-Blur-Restoration-Pro
```

### 2. Create and activate a virtual environment

**Windows PowerShell**
```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Run the application

```bash
uvicorn backend.main:app --reload
```

Open **http://127.0.0.1:8000/motion-blur**.

Interactive API documentation: **http://127.0.0.1:8000/docs**

## API reference

### `POST /api/motion-blur`

Accepts `multipart/form-data`.

| Field | Type | Default | Description |
|---|---|---:|---|
| `image` | File | Required | PNG, JPG/JPEG or WEBP image |
| `blur_type` | String | `linear` | `linear`, `circular`, `uniform` or `non-uniform` |
| `length` | Integer | `18` | Motion length in pixels |
| `angle` | Number | `0` | Motion direction in degrees (0–180) |
| `strength` | Number | `0.008` | Wiener regularization (0.001–0.05) |

Successful responses include the selected parameters and a `processed_url` for the generated output.

### Other endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service health response |
| GET | `/api/result/{filename}` | Retrieve a generated WEBP result |
| GET | `/` or `/motion-blur` | Serve the application |

## Configuration and limits

- Accepted formats: PNG, JPEG and WEBP.
- Maximum upload size: 12 MB.
- Maximum image dimensions: 4 million pixels in total.
- Generated results are written to `MOTION_OUTPUT_DIR`, defaulting to `/tmp/motion-blur-restoration`.
- On serverless hosting, local output storage is temporary and may not persist between instances or deployments. Download results promptly.

## Scientific limitations

- The PSF is built from user-provided model and parameter estimates; the application does not infer an unknown kernel from the image.
- Circular and non-uniform kernels are simplified approximations of motion trajectories.
- Wiener deconvolution balances inverse filtering and noise suppression; it cannot guarantee recovery of details lost during capture.
- Output quality depends on the selected model, parameter accuracy, image noise and blur severity.
- Very small images may not support the selected kernel size.

## Quality checks

The GitHub Actions workflow runs on pushes and pull requests to `main`. It currently checks:

1. Python compilation.
2. JavaScript syntax.
3. Expected FastAPI routes.
4. Normalization of all four PSF kernels.
5. A small Wiener restoration smoke test.

These checks are not a substitute for end-to-end browser testing on a deployed environment.

## Deployment

This repository includes a Vercel configuration and the ASGI entry point at `api/index.py`.

1. Import this repository into your Vercel account.
2. Set the project root to the repository root.
3. Keep the included Vercel configuration.
4. Deploy and verify `/api/health`.
5. Test image upload, restoration, result preview and download.

See [Vercel's deployment documentation](https://vercel.com/docs/deployments) for platform-specific configuration.

## Contributing

Contributions and suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use the issue templates to report bugs or propose improvements.

## Security

Please do not publish credentials, private images, or sensitive information in issues. For vulnerability reports, follow [SECURITY.md](SECURITY.md).

## License

Distributed under the [MIT License](LICENSE).

## Acknowledgements

Built as a Digital Image Processing project to explore point-spread functions, frequency-domain filtering and practical image restoration.

<div align="center">

**Made for learning, experimentation and image processing.**

</div>
