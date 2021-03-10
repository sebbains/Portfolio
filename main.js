const projectList = document.querySelectorAll('.project');
const btnList = document.querySelectorAll('.filterBtn');
const lastPushTime = document.querySelector('#lastPushTime');
const lastPushDay = document.querySelector('#lastPushDay');
const createdRepos = document.querySelector('#createdRepos');
const last30days = document.querySelector('#last30events');
const estimatedCoffeesThisYear = document.querySelector('#estimatedCoffees');
const githubPages = [];

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
async function getEventStats(url) {
    const response = await fetch(url);
    if(!response.ok) {
        throw new Error(`HTTP events error! status: ${response.status}`);
    } else {
        const data = await response.json();
        // get important page events info
        const githubPageInfo = getGithubPageInfo(data);
        // add to array 
        githubPages.push(githubPageInfo);

        // if 30 items within date limit then get next page
        if (githubPageInfo.afterDateLimitEventsTotal === 30){
            console.log("more than 30 events matched date limit, grabbing next page URL");
            // get headers and links
            const headerLinks = response.headers.get("link");
            const pageLinks = headerLinks.split(",");
            const pageUrls = pageLinks.map(page => {
                const urlParts = page.split(";");
                return {
                    url : urlParts[0].replace("<","").replace(">",""),
                    rel : urlParts[1]
                }
            })
            const nextPage = pageUrls.filter(url => {
                if( url.rel.includes("next")){
                    return url;
                }
            })
            const nextPageUrl = nextPage[0].url;
            // call again with next page url
            getEventStats(nextPageUrl);
        } else {
            // calculate total events within date limit
            const totalEventsWithinLimit = githubPages.reduce((total, page) => total += page.afterDateLimitEventsTotal, 0);
            last30days.innerText = totalEventsWithinLimit; 
        }
    }
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
    return {lastPushEvent, pageEndEvent, afterDateLimitEventsTotal};
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


const url = 'https://api.github.com/users/sebbains/events';
getEventStats(url)
    .then(() => {
        // populate page with first faetch call info
        // last push event
        const lastEventDate = githubPages[0].lastPushEvent.created_at;
        const lastEventDateObj = dateSplitter(new Date (lastEventDate));
        const mins = lastEventDateObj.mins < 10? `0 ${lastEventDateObj.mins}`: lastEventDateObj.mins;
        const time = `${lastEventDateObj.hour} : ${mins}`;
        lastPushTime.innerText = time;

        // compare to today
        const currentDateObj = dateSplitter(new Date);
        const isToday = (lastEventDateObj.date === currentDateObj.date && lastEventDateObj.day === currentDateObj.day)? true: false;
        const day = isToday? 'today' : `${lastEventDateObj.day}`;
        lastPushDay.innerText = day;

        // estimate coffees
        const yearDate = new Date(new Date().getFullYear(), 0, 1);
        const currentDate = new Date();
        const diffDays = parseInt((currentDate - yearDate) / (1000 * 60 * 60 * 24), 10);
        const estimatedCoffees = diffDays * 2;
        estimatedCoffeesThisYear.innerText = estimatedCoffees;
    })
    .catch(e => console.log("error fetching github stats " + e.message));

getRepoStats()
    .catch(e => console.log("error fetching github stats " + e.message));