# [<img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>](https://pqina.nl/filepond/)

A JavaScript library that can upload anything you throw at it, optimizes images for faster uploads, and offers a great, accessible, silky smooth user experience.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pqina/filepond/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/filepond.svg)](https://www.npmjs.com/package/filepond)
![npm](https://img.shields.io/npm/dt/filepond)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/filepond)](https://bundlephobia.com/package/filepond)

FilePond adapters are available for **[React](https://github.com/pqina/react-filepond)**, **[Vue](https://github.com/pqina/vue-filepond)**, **[Angular](https://github.com/pqina/ngx-filepond)**, **[Svelte](https://github.com/pqina/svelte-filepond)**, and **[jQuery](https://github.com/pqina/jquery-filepond)**

### Core Features

-   Accepts **directories**, **files**, blobs, local URLs, **remote URLs** and Data URIs.
-   **Drop files**, select on filesystem, **copy and paste files**, or add files using the API.
-   **Async uploads** with AJAX, supports **chunk uploads**, can encode files as base64 data and send along form post.
-   **Accessible**, tested with AT software like VoiceOver and JAWS, **navigable by Keyboard**.
-   **Image optimization**, automatic image resizing, **cropping**, filtering, and **fixes EXIF orientation**.
-   **Responsive**, automatically scales to available space, is functional on both **mobile and desktop devices**.

[Learn more about FilePond](https://pqina.nl/filepond/)

[<img src="https://github.com/pqina/filepond-github-assets/blob/master/filepond-animation-01.gif?raw=true" width="370" alt=""/>](https://pqina.nl/filepond/)

upload.php:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Upload</title>
    <link rel="stylesheet" href="filepond/filepond.css">
    <link rel="stylesheet" href="filepond/image-preview.min.css">
</head>

<body>
    <h1>File Upload</h1>
    <form action="" method="post">
        <input type="file" name="file" id="singleUpload">
        <input type="hidden" name="photo">
    </form>

    <script src="filepond/exif-orientation.min.js"></script>
    <script src="filepond/file-encode.min.js"></script>
    <script src="filepond/filepond.min.js"></script>
    <script src="filepond/image-preview.min.js"></script>
    <script src="filepond/validate-size.min.js"></script>
    <script src="filepond/validate-type.js"></script>
    <script src="upload.js"></script>
</body>

</html>
```

upload.js:

```
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
```

controller - upload.php:

```<?php
$errors = [];

function validate_file($file_name, $file_location, $file_size){
    global $errors;
    if(!$_FILES[$file_name]["name"]){
        array_push($errors, "File cannot be empty, please Upload a file!!!");
    }else{
      $fileimg = basename($_FILES[$file_name]["name"]);
      $extension = array_slice(explode('.',$fileimg),-1)[0];
      $rand = rand(0,100);
      $filecheck = uniqid().$rand.'.'.$extension;
      $fileimg = uniqid().$rand.'.png';
      $fileloc = "$file_location$fileimg";
      $img_size = $_FILES[$file_name]["size"];
      $img_type = strtolower(pathinfo($filecheck,PATHINFO_EXTENSION));
      $img_tmp = $_FILES[$file_name]["tmp_name"];
      if($img_type != "jpg" && $img_type != "png" && $img_type  != "webp" && $img_type != "jpeg" && $img_type != "ico"){
        array_push($errors, "File type must be jpg, jpeg, png, or webp!!!");
      }else{
        $check = getimagesize($img_tmp);
        if($check == false) {
           array_push($errors, "Please Upload a valid image!!!");
        }
      }
      if($img_size > $file_size){
        array_push($errors, "File size too large Upload an image less than 500kb!!!");
      } 
    }

    if(count($errors) == 0){
      $move = move_uploaded_file($img_tmp, $fileloc);
      return $fileimg;
    }else{
      array_push($errors, "Sorry, there was an error uploading your image!!!");
    }
}

if($_SERVER['REQUEST_METHOD'] == "POST" && !empty($_FILES['file'])){
    $newfilename = validate_file("file", "../images/", 53044050);
    if(count($errors) == 0){
        echo json_encode(['success' => true, 'filename' => $newfilename]);
    }else{
        echo json_encode(['success' => false, 'error' => $errors['0']]);
    }
}else{
    echo json_encode(['success' => false, 'error' => 'No file received']);
}
?>
```

delete.php:

```html
<?php
$filename = trim(file_get_contents("php://input"));
if (!$filename) {
    echo json_encode(["success" => false, "error" => "No filename provided"]);
    exit;
}

$filename = basename($filename);
$filePath = "../images/" . $filename;
if (file_exists($filePath)) {
    if (unlink($filePath)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "File could not be deleted"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "File does not exist"]);
}
?>
```
