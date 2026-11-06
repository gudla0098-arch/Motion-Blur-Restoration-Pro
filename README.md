<div align="center">

# Motion Blur Restoration Pro

**A focused Digital Image Processing workspace for model-based motion blur restoration.**

[![CI](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro/actions/workflows/smoke-check.yml/badge.svg?branch=main)](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro/actions/workflows/smoke-check.yml)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[**Repository**](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro) · [Report an issue](https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro/issues)

</div>

---

## Overview

Motion blur occurs when a camera or subject moves while an image is being captured. This project provides an interactive workflow to model that movement with a **point-spread function (PSF)** and attempt image restoration through **Wiener deconvolution**.

Upload an image, select an approximate blur model, tune the motion parameters, and compare or download the restored output.

## Highlights

- **Purpose-built interface:** responsive restoration workspace with an image upload panel, model selection, parameter controls, and results comparison.
- **Image input:** PNG, JPG/JPEG, and WEBP uploads (maximum 12 MB and 4 million pixels).
- **Four PSF approximations:** linear, circular, uniform, and non-uniform.
- **Interactive parameters:** motion length, motion angle, and Wiener regularization strength.
- **Image restoration:** frequency-domain Wiener filtering with NumPy and FFT.
- **Output:** side-by-side input/output preview and WEBP download.
- **API:** FastAPI endpoints for processing and result retrieval.
- **Quality checks:** GitHub Actions smoke checks for syntax, routes, PSF normalization, and image restoration.

## How it works

```text
       Upload an image
              |
              v
       Select blur model
              |
              v
   Set motion length and angle
              |
              v
     Construct normalized PSF
              |
              v
     Wiener deconvolution
              |
              v
     Compare and download
```

## Blur models

| Model | Approximation |
|---|---|
| Linear | Directional straight-line movement with a weighted kernel |
| Circular | Approximate rotational movement around the image centre |
| Uniform | Constant-weight straight-line movement |
| Non-uniform | Curved movement trajectory approximation |

## Scientific scope and limitations

This application performs **model-based restoration**, not blind estimation of an unknown blur kernel. The user chooses a model and supplies motion parameters; the backend constructs a PSF prior and applies Wiener deconvolution.

The circular and non-uniform models are simplified approximations. Deconvolution cannot reliably recover information that was never captured. Results depend on the accuracy of the selected model, image noise, and blur severity. Treat the output as an estimate rather than a guaranteed reconstruction of the original scene.

## Technology

| Layer | Tools |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python, FastAPI |
| Image processing | NumPy, Pillow, FFT-based Wiener filtering |
| Hosting configuration | Vercel |
| Continuous integration | GitHub Actions |

## Repository structure

```text
.
├── .github/workflows/
│   └── smoke-check.yml       # Automated checks
├── api/
│   └── index.py              # Vercel ASGI entry point
├── backend/
│   └── main.py               # API and image processing
├── motion-blur.html          # Main workspace
├── motion-blur.css           # Workspace styling
├── motion-blur.js            # Upload, controls and API calls
├── styles.css                # Shared design foundation
├── requirements.txt
├── vercel.json
├── LICENSE
└── README.md
```

## Run locally

### Requirements

- Python 3.12
- Git

### 1. Clone

```bash
git clone https://github.com/gudla0098-arch/Motion-Blur-Restoration-Pro.git
cd Motion-Blur-Restoration-Pro
```

### 2. Create a virtual environment

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

### 4. Start the server

```bash
uvicorn backend.main:app --reload
```

Open http://127.0.0.1:8000/motion-blur. Interactive API documentation is at http://127.0.0.1:8000/docs.

## API reference

### `POST /api/motion-blur`

Accepts `multipart/form-data`.

| Field | Type | Default | Description |
|---|---|---:|---|
| `image` | File | Required | PNG, JPG/JPEG or WEBP image |
| `blur_type` | String | `linear` | `linear`, `circular`, `uniform`, or `non-uniform` |
| `length` | Integer | `18` | Motion length in pixels; bounded to valid image dimensions |
| `angle` | Number | `0` | Motion direction in degrees (0–180) |
| `strength` | Number | `0.008` | Wiener regularization (0.001–0.05) |

A successful response includes the model and processing parameters, plus `processed_url`.

### `GET /api/result/{filename}`

Returns a generated WEBP image by its server-generated filename.

### `GET /api/health`

Returns a small service health response.

## Deploy to Vercel

The repository includes a Vercel configuration with `api/index.py` as its Python ASGI entry point.

1. Import `gudla0098-arch/Motion-Blur-Restoration-Pro` into Vercel.
2. Keep the repository root as the project root.
3. Deploy using the included `vercel.json`.
4. Test the health endpoint, upload, restoration, preview, and download on the deployed URL.

Generated results use temporary server storage. On serverless hosting, this storage is not permanent; download a result while it remains available.

## Quality checks

The GitHub Actions workflow runs on pushes and pull requests to `main`. It checks Python compilation, JavaScript syntax, API routes, normalized PSF kernels for all four models, and a small Wiener restoration smoke test.

These automated smoke checks do not replace browser testing against a live deployment.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local verification and pull request guidance.

## License

Released under the [MIT License](LICENSE).

---

<div align="center">

**Built as a Digital Image Processing project.**

</div>
