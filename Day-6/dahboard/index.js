function selectActiveNav(){
    const activeNav = document.querySelectorAll(".navLink")
    activeNav.forEach((link)=>{
        link.addEventListener("click",function(e){
            activeNav.forEach((l1)=>{
                l1.classList.remove("active")
            })
            this.classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded",selectActiveNav);

function selectActiveToggle(){
    const activeNav = document.querySelectorAll(".tog")
    activeNav.forEach((link)=>{
        link.addEventListener("click",function(e){
            activeNav.forEach((l1)=>{
                l1.classList.remove("activeTog")
            })
            this.classList.add("activeTog");
        });
    });
}

document.addEventListener("DOMContentLoaded",selectActiveToggle);

const cards = [
    {
      "title": "Acceleration",
      "subject": "Physics",
      "grade": "Grade 7",
      "tag": "+2",
      "units": 4,
      "lessons": 18,
      "topics": 24,
      "classOptions": [
        "Mr. Frank's Class B",
        "Mr. Frank's Class A",
        "Mr. Frank's Class C"
      ],
      "students": 50,
      "dateRange": "21-Aug-2020 - 21-Aug-2020",
      "image": "../Assets/images/imageMask-1.svg",
      "icons": {
        "preview": "../Assets/icons/preview.svg",
        "manageCourse": "../Assets/icons/manage course.svg",
        "gradeSubmissions": "../Assets/icons/grade submissions.svg",
        "reports": "../Assets/icons/reports.svg"
      },
      "favouriteIcon": "../Assets/icons/favourite.svg",
      "expired": false
    },
    {
      "title": "Displacement, Velocity and Speed",
      "subject": "Physics 2",
      "grade": "Grade 6",
      "tag": "+3",
      "units": 2,
      "lessons": 15,
      "topics": 20,
      "classOptions": [
        "No Classes",
        "Mr. Frank's Class A",
        "Mr. Frank's Class C"
      ],
      "students": null,
      "dateRange": null,
      "image": "../Assets/images/imageMask-2.svg",
      "icons": {
        "preview": "../Assets/icons/preview.svg",
        "manageCourse": "../Assets/icons/manage course2.svg",
        "gradeSubmissions": "../Assets/icons/grade submissions2.svg",
        "reports": "../Assets/icons/reports.svg"
      },
      "favouriteIcon": "../Assets/icons/favourite.svg",
      "expired": false
    },
    {
      "title": "Introduction to Biology: Micro organisms and how they affect the other Life Systems in En...",
      "subject": "Biology",
      "grade": "Grade 4",
      "tag": "+1",
      "units": 5,
      "lessons": 16,
      "topics": 24,
      "classOptions": [
        "All Classes",
        "Mr. Frank's Class A",
        "Mr. Frank's Class C"
      ],
      "students": 300,
      "dateRange": null,
      "image": "../Assets/images/imageMask.svg",
      "icons": {
        "preview": "../Assets/icons/preview.svg",
        "manageCourse": "../Assets/icons/manage course2.svg",
        "gradeSubmissions": "../Assets/icons/grade submissions2.svg",
        "reports": "../Assets/icons/reports.svg"
      },
      "favouriteIcon": "../Assets/icons/favourite.svg",
      "expired": false
    },
    {
      "title": "Introduction to High School Mathematics",
      "subject": "Mathematics",
      "grade": "Grade 8",
      "tag": "+3",
      "units": null,
      "lessons": null,
      "topics": null,
      "classOptions": [
        "Mr. Frank's Class B",
        "Mr. Frank's Class A",
        "Mr. Frank's Class C"
      ],
      "students": 44,
      "dateRange": "14-Oct-2019 - 20-Oct-2019",
      "image": "../Assets/images/imageMask-3.svg",
      "icons": {
        "preview": "../Assets/icons/preview.svg",
        "manageCourse": "../Assets/icons/manage course.svg",
        "gradeSubmissions": "../Assets/icons/grade submissions.svg",
        "reports": "../Assets/icons/reports.svg"
      },
      "favouriteIcon": "../Assets/icons/favourite2.svg",
      "expired": true
    }
  ]

const markup = `${cards.map((card)=>{
    const optionsMarkup =
        card.classOptions && card.classOptions.length > 0
          ? card.classOptions
            .map(
              (cls) =>
                `<option value="${cls}" ${cls === card.selectedClass ? "selected" : ""
                }>${cls}</option>`
            )
            .join("")
          : `<option value="" disabled selected>No classes</option>`;
 
      const selectMarkup =
        !card.selectedClass && card.classOptions && card.classOptions.length > 0
          ? `<option value="" disabled selected>No classes</option>` +
          optionsMarkup
          : optionsMarkup;
 
    return `<div class="card">
    <div class="cardContent">
      <div class="cardImage">
        <img src="${card.image}" alt="card Image">
      </div>
      <div class="cardText">
        <div class="card_title">
          ${card.title}
          <img src="${card.favouriteIcon}" alt="favourite" />
        </div>
        <div class="card_text">
        ${card.subject}
          <div class="devider"></div>
          ${card.grade}
          <span class="card_text_green">${card.tag  ? `${card.tag}` : ""}</span>
        </div>
        <div class="card_text">
          <span><b style="color: black">${card.units ? `${card.units}` : ""}</b>${card.units ? ` Units` : ""}</span>
          <span><b style="color: black">${card.lessons ? `${card.lessons}` : ""}</b>${card.lessons ? `  Lessons` : ""}</span>
          <span><b style="color: black">${card.topics ? `${card.topics}` : ""}</b>${card.topics ? `  Topics` : ""}</span>
        </div>
        <div class="card_select_div">
        <select class="card_select" name="classes" id="classes">
        ${selectMarkup}
      </select>
        </div>
        <div class="card_text">
          ${card.students ? `${card.students} Students` : ""}
          ${card.students && card.dateRange ? `<span class="devider"></span>` : ""}  
          ${card.dateRange ? `${card.dateRange}` : ""}
        </div>
      </div>
    </div>
    <div class="cardIcons">
      <div class="preview">
        <img src="${card.icons.preview}" alt="preview icon">
      </div>
      <div class="mngCourse">
        <img src="${card.icons.manageCourse}" alt="manage course icon">
      </div>
      <div class="grdSubmission">
        <img src="${card.icons.gradeSubmissions}" alt="grade submissions icon">
      </div>
      <div class="reports">
        <img src="${card.icons.reports}" alt="reports icon">
      </div>
          ${card.expired ? `<div class="expired">
          EXPIRED
        </div>` : ''}
    </div>
    </div>`
}).join("")}`

document.getElementById("imageContent").innerHTML = markup;