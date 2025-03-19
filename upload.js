
    function setupFilePond(inputElement, isMultiple, inputname) {
        FilePond.registerPlugin(
            FilePondPluginFileValidateType,
            FilePondPluginImagePreview,
            FilePondPluginFileEncode,
            FilePondPluginFileValidateSize,
            FilePondPluginImageExifOrientation
        );
      
        let inputName = inputname;
        let productphoto = document.querySelector(`input[name="${inputName}"]`).value;
        
        let productphotoArray = [];
        let uploadedFiles = {};  // ✅ Initialize this first
      
        if (productphoto) {
            try {
                if (isMultiple) {
                    const parsedPhotos = JSON.parse(productphoto);
                    productphotoArray = parsedPhotos.map(image => {
                        let trimmedImage = image.trim();
                        uploadedFiles[trimmedImage] = trimmedImage; // ✅ Store preloaded file references
                        return {
                            source: trimmedImage,
                            options: {
                                type: 'local',
                                metadata: {
                                    poster: `images/${trimmedImage}`
                                }
                            }
                        };
                    });
                } else {
                    let trimmedImage = productphoto.trim();
                    uploadedFiles[trimmedImage] = trimmedImage; // ✅ Store single preloaded file
                    productphotoArray = [{
                        source: trimmedImage,
                        options: {
                            type: 'local',
                            metadata: {
                                poster: `images/${trimmedImage}`
                            }
                        }
                    }];
                }
            } catch (error) {
                console.error("Error parsing productphoto JSON:", error);
            }
        }
      
        const pond = FilePond.create(inputElement, {
            labelIdle: `<i class="fa-solid fa-cloud-upload fa-fw f-s-60 text-secondary"></i> 
                        <div class="filepond--label-action text-decoration-none">
                            Upload Your ${isMultiple ? 'Images' : 'Image'}
                        </div>`,
            maxFileSize: '10MB',
            allowMultiple: isMultiple,
            server: {
                process: {
                    url: 'controller/upload.php',
                    method: 'POST',
                    name: 'file',
                    onload: (response) => {
                        console.log(response)
                        try {
                            const parsedResponse = JSON.parse(response);
                            if (parsedResponse.success && parsedResponse.filename) {
                                return parsedResponse.filename;
                            } else {
                                console.error("Upload failed:", parsedResponse.error);
                                return null;
                            }
                        } catch (error) {
                            console.error("Error parsing upload response:", error);
                            return null;
                        }
                    }
                },
                revert: (uniqueFileId, load, error) => {
                    fetch('controller/deletefile.php', {
                        method: 'POST',
                        body: uniqueFileId,
                        headers: { 'Content-Type': 'text/plain' }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.success) {
                            load();
                        } else {
                            console.error("Failed to delete file:", data.error);
                            error("Delete failed");
                        }
                    })
                    .catch(err => {
                        console.error("Error in delete request:", err);
                        error("Server error");
                    });
                },
                restore: (uniqueFileId, load, error) => {
                    load(uniqueFileId);
                },
                load: (source, load, error, progress, abort) => {
                  fetch(`images/${source}`)
                      .then(response => response.blob())
                      .then(blob => load(blob))
                      .catch(err => {
                          console.error("Error loading image:", err);
                          error("Could not load image");
                      });
                }
            },
            files: productphotoArray,
        });
      
        pond.on('processfile', (error, file) => {
          if (error) {
              console.error("Error processing file:", error);
              return;
          }
          let productphotoInput = document.querySelector(`input[name="${inputName}"]`);
          if (!file.serverId) {
              console.error("File serverId is missing:", file);
              return;
          }
          if (isMultiple) {
            uploadedFiles[file.id] = file.serverId;
            let existingFiles;
            try {
                existingFiles = productphotoInput.value ? JSON.parse(productphotoInput.value) : [];
            } catch (e) {
                existingFiles = productphotoInput.value ? [productphotoInput.value] : [];
            }
            if (!Array.isArray(existingFiles)) {
                existingFiles = [];
            }
            existingFiles.push(file.serverId);
            productphotoInput.value = JSON.stringify(existingFiles);
          } else {
            productphotoInput.value = file.serverId;
          }
        });
      
        pond.on('removefile', (error, file) => {
          if (error) {
              console.error("Error removing file:", error);
              return;
          }
          let productphotoInput = document.querySelector(`input[name="${inputName}"]`);
          if (isMultiple) {
              let fileNameToRemove = file.serverId || uploadedFiles[file.source];
          
              if (!fileNameToRemove) {
                  console.error("No valid file reference found for removal.");
                  return;
              }
      
              let existingFiles;
              try {
                  existingFiles = productphotoInput.value ? JSON.parse(productphotoInput.value) : [];
              } catch (e) {
                  existingFiles = productphotoInput.value ? [productphotoInput.value] : [];
              }
      
              if (!Array.isArray(existingFiles)) {
                  existingFiles = [];
              }
      
              existingFiles = existingFiles.filter(fileName => fileName !== fileNameToRemove);
              productphotoInput.value = existingFiles.length > 0 ? JSON.stringify(existingFiles) : '';
              delete uploadedFiles[fileNameToRemove]; // ✅ Ensure removal tracking
          } else {
              productphotoInput.value = '';
          }
      
          console.log("Updated productphotoInput value after delete:", productphotoInput.value);
        });
    }
    
    const singleFileInput = document.querySelector("#singleUpload");
    if(singleFileInput){
        setupFilePond(singleFileInput, false, "photo");
    }
