<?php
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