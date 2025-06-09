document.getElementById("submit_button").addEventListener("click",function(event){
    event.preventDefault()
    validateForm();
});
 
function validateForm(){
    var x = document.getElementById("uname").value;
 
    if(x == ""){
        alert("Please Enter name");
        document.getElementById("uname").focus();
        return false;
 
    }
    var y = document.getElementById("comment").value;
 
    if(y == ""){
        alert("Please Enter comment");
        document.getElementById("comment").focus();
        return false;
    }

    var ml = document.getElementById("male").checked;
    var fml = document.getElementById("female").checked;

    if(ml== false && fml == false){
        alert("Please select gender");
        document.getElementsByName('gender')[0].focus();
        return false;
    }
 
    document.getElementById("uname").value = "";
    document.getElementById("comment").value = "";
}