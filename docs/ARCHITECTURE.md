# Architecture and Processing Design

## System overview

The application uses a lightweight browser frontend and a Python API.

```text
Browser
  |
  | HTML / CSS / JavaScript
  |
  | POST multipart/form-data
  v
FastAPI application
  |
  +--> Validate upload and image dimensions
  |
  +--> Convert image to RGB pixel array
  |
  +--> Build normalized point-spread function (PSF)
  |
  +--> Apply frequency-domain Wiener filter
  |
  +--> Save WEBP output
  |
  v
JSON response with processed_url
  |
  v
Browser loads preview and offers download
```

## Main modules

| Path | Responsibility |
|---|---|
| `motion-blur.html` | Application structure and accessible controls |
| `styles.css` | Shared visual foundation |
| `motion-blur.css` | Workspace-specific responsive styling |
| `motion-blur.js` | File validation, UI state, parameter controls and API requests |
| `backend/main.py` | FastAPI routes, PSF generation and restoration |
| `api/index.py` | Vercel ASGI application entry point |

## Processing pipeline

### 1. Input validation

The API reads the uploaded image, enforces the file-size limit, verifies supported image formats and checks total pixel count before processing.

### 2. PSF construction

The selected model and motion parameters define a point-spread function. The kernel is normalized so its weights sum to one.

- Linear: weighted samples along a straight trajectory.
- Uniform: equal-weight samples along a straight trajectory.
- Circular: samples along an approximate arc.
- Non-uniform: samples along a curved trajectory.

### 3. Wiener deconvolution

The PSF is padded to the image dimensions and transformed into the frequency domain. For each RGB channel, the implementation applies a stabilized Wiener-style filter:

`F_{restored}(u,v) = [H^*(u,v) / (|H(u,v)|^2 + K)] F_{input}(u,v)`

Here, `H` is the PSF transfer function, `H*` is its complex conjugate, and `K` is the regularization strength.

### 4. Output

The restored channels are clipped to the valid 8-bit range, encoded as WEBP and saved under a generated filename. The API returns a relative URL for the browser to display and download.

## API contract

### POST `/api/motion-blur`

Input: multipart fields `image`, `blur_type`, `length`, `angle` and `strength`.

Output: JSON containing the selected blur model, parameter values, kernel size, method, output size and `processed_url`.

### GET `/api/result/{filename}`

Returns a generated WEBP result. The route validates the filename pattern before resolving it inside the output directory.

### GET `/api/health`

Returns a lightweight health response for deployment checks.

## Important implementation notes

- This implementation is **model-based restoration**, not blind deblurring or automatic unknown-kernel estimation.
- Serverless local storage is ephemeral. Results should be downloaded promptly.
- The current CI suite is a smoke test, not a full visual-quality benchmark.
- Any changes to the mathematical implementation should be accompanied by numerical tests and representative image comparisons.
