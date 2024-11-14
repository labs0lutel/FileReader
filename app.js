document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const fileList = document.getElementById("file-list");
    const fileTypeFilter = document.getElementById("file-type");
    const fileSizeFilter = document.getElementById("file-size");

    const locationButton = document.getElementById('get-location');
    const cameraButton = document.getElementById('start-camera');
    const camera = document.getElementById('camera');
    const captureButton = document.getElementById('capture-photo');
    const locationOutput = document.getElementById('location-output');
    const cameraOutput = document.getElementById('camera-output');
    const photoCanvas = document.getElementById('photo-canvas');

    let files = JSON.parse(localStorage.getItem('files')) || [];

    function displayFiles(filesToDisplay) {
        fileList.innerHTML = '';
        filesToDisplay.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.innerHTML = `
                <span>Title: ${file.name}</span>
                <span>Type: ${file.type}</span>
                <span>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button onclick="downloadFile(${index})">Download</button>
                <button onclick="deleteFile(${index})">Remove</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    function filterFiles() {
        const fileType = fileTypeFilter.value;
        const fileSize = parseFloat(fileSizeFilter.value) * 1024 * 1024;

        const filteredFiles = files.filter(file => {
            const isTypeMatch = fileType ? file.type.includes(fileType) : true;
            const isSizeMatch = fileSize ? file.size <= fileSize : true;
            return isTypeMatch && isSizeMatch;
        });

        displayFiles(filteredFiles);
    }

    function addFilesToStorage(newFiles) {
        files = [...files, ...newFiles];
        localStorage.setItem('files', JSON.stringify(files));
        filterFiles();
    }

    function downloadFile(index) {
        const file = files[index];
        const blob = new Blob([file], { type: file.type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
    }

    function deleteFile(index) {
        files.splice(index, 1);
        localStorage.setItem('files', JSON.stringify(files));
        filterFiles();
    }

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('hover');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('hover');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('hover');
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFilesToStorage(droppedFiles);
    });

    fileInput.addEventListener('change', (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFilesToStorage(selectedFiles);
    });

    dropArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileTypeFilter.addEventListener('change', filterFiles);
    fileSizeFilter.addEventListener('input', filterFiles);

    locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    locationOutput.innerHTML = `Latitude: ${latitude}, Longitude: ${longitude}`;
                },
                (error) => {
                    locationOutput.innerHTML = `Error: ${error.message}`;
                }
            );
        } else {
            locationOutput.innerHTML = 'Geolocation is not supported by this browser.';
        }
    });

    cameraButton.addEventListener('click', () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    camera.srcObject = stream;
                    cameraOutput.style.display = 'block';
                })
                .catch((error) => {
                    cameraOutput.innerHTML = `Error: ${error.message}`;
                });
        } else {
            cameraOutput.innerHTML = 'Camera is not supported by this browser.';
        }
    });

    captureButton.addEventListener('click', () => {
        const context = photoCanvas.getContext('2d');
        context.drawImage(camera, 0, 0, photoCanvas.width, photoCanvas.height);
        const photoData = photoCanvas.toDataURL('image/png');
        displayCapturedPhoto(photoData);
    });

    function displayCapturedPhoto(photoData) {
        const img = document.createElement('img');
        img.src = photoData;
        img.classList.add('captured-photo');
        img.style.maxWidth = '100%';

        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photo-container');

        const downloadLink = document.createElement('a');
        downloadLink.href = photoData;
        downloadLink.download = 'captured-photo.png';
        downloadLink.textContent = 'Download';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            photoContainer.remove();
        });

        photoContainer.addEventListener('mouseover', () => {
            downloadLink.style.display = 'block';
            deleteButton.style.display = 'block';
        });

        photoContainer.addEventListener('mouseout', () => {
            downloadLink.style.display = 'none';
            deleteButton.style.display = 'none';
        });

        photoContainer.appendChild(img);
        photoContainer.appendChild(downloadLink);
        photoContainer.appendChild(deleteButton);

        cameraOutput.appendChild(photoContainer);
    }

    displayFiles(files);
});
