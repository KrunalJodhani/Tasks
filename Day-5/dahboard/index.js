function selectActiveNav(){
    console.log("error");
    const activeNav = document.querySelectorAll(".navLink")
    activeNav.forEach((link)=>{
        console.log("something");
        link.addEventListener("click",function(e){
            activeNav.forEach((l1)=>{
                l1.classList.remove("active")
            })
            this.classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded",selectActiveNav);