const projectList = document.querySelectorAll(".project");
const btnList = document.querySelectorAll(".filterBtn");

// default show all projects on page load
applyFilter("all");

// adds selected class to display project as per filter button
function applyFilter(filter){
    // first remove all previously selected classes
    projectList.forEach(project => {
        project.classList.remove("selected");
    });
    if(filter === "all"){
        // if no filter (show all) add to every element
        projectList.forEach(project => {
            project.classList.add("selected");
        });
    }else{
        // apply selected class to specified class
        projectList.forEach(project => {
            //use spread to copy into array for includes
            if([...project.classList].includes(filter)){
                project.classList.add("selected");
            }
        });
    };
}

// applies selected project filter and highlights button selected 
btnList.forEach(btn => {
    btn.addEventListener("click", function(){
        // first remove the current active class
        btnList.forEach(btn => btn.classList.remove("active"));
        // apply class to current clicked button
        btn.classList.add("active");
        // run project filter on selected button
        const filter = btn.innerHTML.toLowerCase();
        applyFilter(filter);
    });
});