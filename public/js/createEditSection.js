$(document).ready(function(){
    
   // Show/hide edit panel 
   $("#galleryEditButton").on('click',function(){
       $("#editPanel").slideToggle();
       console.log("Edit button clicked.");
       $("#saveGalleryPropertiesButton").slideDown();
       $("#savePhotoPropertiesButton").slideDown();
       
       $("#finishGalleryButton").slideUp();
   }); 
    
    $("#galleryCreateButton").on('click',function(){
       $("#editPanel").slideUp();
       console.log("Create button clicked.");
       $("#saveGalleryPropertiesButton").slideUp();
       $("#savePhotoPropertiesButton").slideUp();
        
        $("#finishGalleryButton").slideDown();
   }); 
    
});