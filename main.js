const projectList = document.querySelectorAll('.project');
const btnList = document.querySelectorAll('.filterBtn');
const lastPushTime = document.querySelector('#lastPushTime');
const lastPushDay = document.querySelector('#lastPushDay');
const createdRepos = document.querySelector('#createdRepos');

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

// get github events stats
async function getEventStats() {
    const url = 'https://api.github.com/users/sebbains/events';
    const response = await fetch(url);

    if(!response.ok) {
        throw new Error(`HTTP events error! status: ${response.status}`);
    } else {
        // last push event
        const data = await response.json();
        const lastEventDate = await data[0].created_at;
        const lastEventDateObj = dateSplitter(new Date (lastEventDate));
        const time = `${lastEventDateObj.hour} : ${lastEventDateObj.mins}`;
        lastPushTime.innerText = time;

        // get important page events info
        const [lastPushEvent, pageEndEvent, afterDateLimitEventsTotal] = getGithubPageInfo(data);
        console.log(lastPushEvent, pageEndEvent, afterDateLimitEventsTotal);

        // compare to today
        const currentDateObj = dateSplitter(new Date);
        const isToday = (lastEventDateObj.date === currentDateObj.date && lastEventDateObj.day === currentDateObj.day)? true: false;
        const day = isToday? 'today' : `${lastEventDateObj.day}`;
        lastPushDay.innerText = day;
        // data.forEach(dataItem => console.log(dataItem.created_at, dataItem.type))
        // console.log(data);

        // get end item
        const endItem = data[29];
        console.log(endItem.created_at);

        // split header links
        const headerLinks = response.headers.get("link");
        const pageLinks = headerLinks.split(",");
        const nextPage = pageLinks[0];
        const nextPageUrl = nextPage.split(";")[0].replace("<","").replace(">","");
        const lastPage = pageLinks[1];
        const lastPageUrl = lastPage.split(";")[1].replace("<","").replace(">","");
        return nextPageUrl;
    }
}

// check github event date
function checkEventDate(githubEvent){

}

// break github array into required info
function getGithubPageInfo(githubArray){
    const lastPushEvent = githubArray.find(event => event.type === 'PushEvent');
    const pageEndEvent = githubArray[29];

    // filter last 30 days
    const dateLimit = 30;
    const dateLimitDate = new Date();
    dateLimitDate.setDate(dateLimitDate.getDate() - dateLimit);
    // refactor to reduce unless require individual events
    const afterDateLimitEvents = githubArray.filter(githubEvent => {
        if (new Date(githubEvent.created_at) > dateLimitDate){
            return githubEvent;
        };
    })
    const afterDateLimitEventsTotal = afterDateLimitEvents.length;
    return [lastPushEvent, pageEndEvent, afterDateLimitEventsTotal];
}

// loop & log github page events
async function logGithubEvents(url) {
    const response = await fetch(url);

    if(!response.ok) {
        throw new Error(`HTTP events error! status: ${response.status}`);
    } else {
        // last push event
        const data = await response.json();
        console.log(data);
    }
}

// split js date into useable obj
function dateSplitter(jsDate){
    const date = jsDate.getDate();
    const day = checkDay(jsDate.getDay());
    const hour = jsDate.getHours();
    const mins = jsDate.getMinutes();
    return {
        date: date,
        day: day,
        hour: hour,
        mins: mins
    }
}

// check day of week
function checkDay(dayNum){
    switch (dayNum) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
}

// get github repos stats
async function getRepoStats() {
    const url = 'https://api.github.com/users/sebbains/repos';
    const response = await fetch(url);

    if(!response.ok) {
        throw new Error(`HTTP events error! status: ${response.status}`);
    } else {
        const data = await response.json();
        const createdPublicRepos = await data.length;
        createdRepos.innerText = createdPublicRepos;
    }
}

getEventStats()
    .then(value => {
        logGithubEvents(value);
    })
    .catch(e => console.log("error fetching github stats " + e.message));

getRepoStats()
    .catch(e => console.log("error fetching github stats " + e.message));