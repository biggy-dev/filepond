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