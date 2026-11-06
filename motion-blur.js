(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const fileInput = $('motion-file');
  const drop = $('motion-drop');
  const processButton = $('restore-motion');
  const status = $('motion-status');
  const descriptions = {
    linear: 'A straight-line point-spread function models directional camera or subject movement.',
    circular: 'A curved point-spread approximation models rotational movement around the image centre.',
    uniform: 'A constant-weight directional kernel assumes consistent movement during exposure.',
    'non-uniform': 'A curved trajectory approximates movement that changes direction over the exposure.'
  };
  let file = null;
  let previewUrl = null;
  let blurType = 'linear';
  let busy = false;

  function setStatus(message, state = '') {
    status.textContent = message;
    status.dataset.state = state;
  }

  function resetResults() {
    $('motion-results').hidden = true;
    $('result-input').removeAttribute('src');
    $('result-output').removeAttribute('src');
    $('download-motion').removeAttribute('href');
  }

  function selectFile(candidate) {
    if (!candidate) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(candidate.type)) {
      setStatus('Unsupported format. Choose a PNG, JPG or WEBP image.', 'error');
      return;
    }
    if (candidate.size > 12 * 1024 * 1024) {
      setStatus('This file is larger than the 12 MB upload limit.', 'error');
      return;
    }
    const objectUrl = URL.createObjectURL(candidate);
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth * probe.naturalHeight > 4_000_000) {
        URL.revokeObjectURL(objectUrl);
        setStatus('This image exceeds the 4 million pixel limit.', 'error');
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = objectUrl;
      file = candidate;
      $('motion-original-thumb').src = previewUrl;
      $('motion-filename').textContent = candidate.name;
      $('motion-dimensions').textContent = probe.naturalWidth + ' × ' + probe.naturalHeight + ' PX';
      $('motion-selected').hidden = false;
      drop.hidden = true;
      processButton.disabled = false;
      resetResults();
      setStatus('Image loaded. Select a motion model and tune the parameters.', 'success');
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setStatus('The selected image could not be read. Try another file.', 'error');
    };
    probe.src = objectUrl;
  }

  $('browse-motion').addEventListener('click', (event) => {
    event.stopPropagation();
    fileInput.click();
  });
  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener('change', (event) => {
    selectFile(event.target.files && event.target.files[0]);
  });
  ['dragenter', 'dragover'].forEach((name) => drop.addEventListener(name, (event) => {
    event.preventDefault();
    drop.classList.add('dragging');
  }));
  ['dragleave', 'drop'].forEach((name) => drop.addEventListener(name, (event) => {
    event.preventDefault();
    drop.classList.remove('dragging');
  }));
  drop.addEventListener('drop', (event) => {
    selectFile(event.dataTransfer && event.dataTransfer.files[0]);
  });

  $('clear-motion').addEventListener('click', () => {
    if (busy) return;
    file = null;
    fileInput.value = '';
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    $('motion-selected').hidden = true;
    $('motion-original-thumb').removeAttribute('src');
    drop.hidden = false;
    processButton.disabled = true;
    resetResults();
    setStatus('Upload an image to enable restoration.');
  });

  document.querySelectorAll('.model-card').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.model-card').forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      blurType = button.dataset.blur;
      $('model-note').textContent = descriptions[blurType];
    });
    button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
  });

  function bindRange(id, outputId, format) {
    const input = $(id);
    const update = () => { $(outputId).innerHTML = format(Number(input.value)); };
    input.addEventListener('input', update);
    update();
  }
  bindRange('motion-length', 'length-value', (value) => value + ' <i>PX</i>');
  bindRange('motion-angle', 'angle-value', (value) => value + '<i>°</i>');
  bindRange('motion-strength', 'strength-value', (value) => (value / 1000).toFixed(3));

  processButton.addEventListener('click', async () => {
    if (!file || busy) return;
    busy = true;
    processButton.disabled = true;
    processButton.querySelector('span:nth-child(2)').textContent = 'Processing image…';
    setStatus('Building the selected blur model and applying Wiener deconvolution. Please keep this page open.', 'working');
    const body = new FormData();
    body.append('image', file, file.name);
    body.append('blur_type', blurType);
    body.append('length', $('motion-length').value);
    body.append('angle', $('motion-angle').value);
    body.append('strength', (Number($('motion-strength').value) / 1000).toFixed(3));
    try {
      const response = await fetch('/api/motion-blur', { method: 'POST', body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'The server could not process this image.');
      if (!data.processed_url) throw new Error('The server response did not include a result image URL.');
      const resultUrl = new URL(data.processed_url, window.location.origin).href;
      $('result-input').src = previewUrl;
      $('result-output').src = resultUrl;
      $('download-motion').href = resultUrl;
      $('download-motion').download = 'motion-restored-image.webp';
      $('result-meta').textContent = 'MODEL: ' + data.blur_type.toUpperCase() +
        '  /  MOTION: ' + data.motion_length_px + ' PX  /  KERNEL: ' + data.kernel_size +
        ' × ' + data.kernel_size + ' PX  /  OUTPUT: ' + data.output_size_kb +
        ' KB  /  METHOD: ' + data.method;
      $('motion-results').hidden = false;
      setStatus('Restoration complete. Review the comparison and download your result.', 'success');
      $('motion-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setStatus(error.message || 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      busy = false;
      processButton.disabled = !file;
      processButton.querySelector('span:nth-child(2)').textContent = 'Estimate & restore image';
    }
  });

  window.addEventListener('beforeunload', () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
})();