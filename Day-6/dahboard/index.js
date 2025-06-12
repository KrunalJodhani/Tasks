function selectActiveNav() {
  const activeNav = document.querySelectorAll(".navLink")
  activeNav.forEach((link) => {
    link.addEventListener("click", function (e) {
      activeNav.forEach((l1) => {
        l1.classList.remove("active")
      })
      this.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", selectActiveNav);

function selectActiveToggle() {
  const activeNav = document.querySelectorAll(".tog")
  activeNav.forEach((link) => {
    link.addEventListener("click", function (e) {
      activeNav.forEach((l1) => {
        l1.classList.remove("activeTog")
      })
      this.classList.add("activeTog");
    });
  });
}

document.addEventListener("DOMContentLoaded", selectActiveToggle);

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

const markup = `${cards.map((card) => {
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
          <span class="card_text_green">${card.tag ? `${card.tag}` : ""}</span>
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

const alertIconTop = document.getElementById("alertTop");
const alertDiv = document.getElementById("alertHover");
const alertIcon = document.getElementById("alertIcon");
let alertDelay;

function showAlert() {
  clearTimeout(alertDelay);
  ancDiv.style.display = "none";
  alertDiv.style.display = "flex";
  alertIconTop.style.display = "none";
  alertIcon.src = "../Assets/icons/alerts2.svg";
}

alertIcon.addEventListener("mouseenter", showAlert);
alertDiv.addEventListener("mouseenter", showAlert);

function hideAlert() {
  alertDelay = setTimeout(function () {
    alertIconTop.style.display = "flex";
    alertIcon.src = "../Assets/icons/alerts.svg";
    alertDiv.style.display = "none";
  }, 200);
}

alertIcon.addEventListener("mouseleave", hideAlert);
alertDiv.addEventListener("mouseleave", hideAlert);

const ancTop = document.getElementById("announcementTop");
const ancDiv = document.getElementById("aanouncementHover");
const ancIcon = document.getElementById("ancIcon");
let ancDelay;

function showAnc() {
  clearTimeout(ancDelay);
  alertDiv.style.display = "none";
  ancDiv.style.display = "flex";
  ancTop.style.display = "none";
  ancIcon.src = "../Assets/icons/announcements2.svg";
}

ancIcon.addEventListener("mouseenter", showAnc);
ancDiv.addEventListener("mouseenter", showAnc);

function hideAnc() {
  ancDelay = setTimeout(function () {
    ancDiv.style.display = "none";
    ancTop.style.display = "flex";
    ancIcon.src = "../Assets/icons/announcements.svg";
  }, 200);
}

ancIcon.addEventListener("mouseleave", hideAnc);
ancDiv.addEventListener("mouseleave", hideAnc);

const button = document.getElementById("navbarToggle");
const div = document.getElementById("navbarMob");
 
let hideTimeout;
function showMenu() {
  if (hideTimeout !== null) {
    clearTimeout(hideTimeout);
  }
  div.style.display = "block";
  div.style.opacity = "0";
  div.offsetHeight;
  div.style.opacity = "1";
}
 
function hideMenu() {
  hideTimeout = setTimeout(function () {
    div.style.display = "none";
  }, 300);
}
 
button.addEventListener("mouseenter", showMenu);
button.addEventListener("mouseleave", hideMenu);
 
div.addEventListener("mouseenter", showMenu);
div.addEventListener("mouseleave", hideMenu);

const navbarLinkHeads = document.querySelectorAll('.navbar_link_head');
 
navbarLinkHeads.forEach(function (linkHead) {
  linkHead.addEventListener('click', function (e) {
    const clickedOnArrow = e.target.tagName === 'IMG';
    const clickedOnLink = e.target.tagName === 'A';
 
    if (clickedOnLink && !clickedOnArrow) {
      return;
    }
 
    e.preventDefault();
 
    const currentNavbarLink = linkHead.closest('.navbar_link');
    const currentBody = currentNavbarLink.querySelector('.navbar_link_body');
 
    if (!currentBody) {
      return;
    }
 
    const allNavbarLinks = document.querySelectorAll('.navbar_link');
    allNavbarLinks.forEach(function (navbarLink) {
      const body = navbarLink.querySelector('.navbar_link_body');
      const arrow = navbarLink.querySelector('img[alt="arrow"]');
 
      if (body && navbarLink !== currentNavbarLink) {
        body.style.display = 'none';
        navbarLink.style.backgroundColor = 'white';
        if (arrow) {
          arrow.style.transform = 'rotate(0deg)';
        }
      }
    });
 
    const currentArrow = currentNavbarLink.querySelector('img[alt="arrow"]');
 
    if (currentBody.style.display === 'flex') {
      currentBody.style.display = 'none';
      if (currentArrow) {
        currentArrow.style.transform = 'rotate(0deg)';
      }
      currentNavbarLink.style.backgroundColor = 'white';
    } else {
      currentBody.style.display = 'flex';
      if (currentArrow) {
        currentArrow.style.transform = 'rotate(180deg)';
      }
      currentNavbarLink.style.backgroundColor = '#EEEEEE';
    }
  });
});
 
document.addEventListener('DOMContentLoaded', function () {
  const allBodies = document.querySelectorAll('.navbar_link_body');
  allBodies.forEach(function (body) {
    body.style.display = 'none';
  });
});

const alerts = [
  {
    title: "License for Introduction to Algebra has been assigned to your school",
    dateTime: "15-Sep-2018 at 07:21 pm",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    course: null
  },
  {
    title: "Lesson 3 Practice Worksheet overdue for Amy Santiago",
    dateTime: "15-Sep-2018 at 07:21 pm",
    icon: "/Day-6/Assets/icons/radio-button-on.svg",
    course: {
      type: "Course",
      name: "Advanced Mathematics"
    }
  },
  {
    title: "23 new students created",
    dateTime: "15-Sep-2018 at 07:21 pm",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    course: null
  },
  {
    title: "15 submissions ready for evaluation",
    dateTime: "15-Sep-2018 at 07:21 pm",
    icon: "/Day-6/Assets/icons/radio-button-on.svg",
    course: {
      type: "Class",
      name: "Advanced Mathematics"
    }
  },
  {
    title: "License for Basic Concepts in Geometry has been assigned to your school",
    dateTime: "15-Sep-2018 at 07:21 pm",
    icon: "/Day-6/Assets/icons/radio-button-on.svg",
    course: null
  },
  {
    title: "Lesson 3 Practice Worksheet overdue for Sam Diego",
    dateTime: "15-Sep-2018 at 07:21 pm",
    icon: "/Day-6/Assets/icons/radio-button-on.svg",
    course: {
      type: "Course",
      name: "Advanced Mathematics"
    }
  }
];

const alertMarkup = `${alerts.map((alert) => {
  return `<div class="alertMain">
    <div class="titleImage">
      <div class="title">
        <p>${alert.title}</p>
      </div>
      <div class="image">
        <img src="${alert.icon}" alt="checknotification">
      </div>
    </div>
    ${alert.course ? `<div class="courseDetails">
      <div class="courseId">${alert.course.type}:</div>
      <div class="courseName">${alert.course.name}</div>
    </div>` : ''}
    <div class="dateTime">
      ${alert.dateTime}
    </div>
  </div>`;
}).join("")}`;

document.querySelector(".allAlert").innerHTML = alertMarkup;

const announcements = [
  {
    paName: "Wilson Kumar",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    title: "No classes will be held on 21st Nov",
    course: "Mathematics 101",
    attachment: {
      fileIcon: "/Day-6/Assets/images/icons8-attach-14.png",
      text: "2 files are attached"
    },
    dateTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    paName: "Wilson Kumar",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    title: "No classes will be held on 21st Nov",
    course: "Mathematics 101",
    attachment: {
      fileIcon: "/Day-6/Assets/images/icons8-attach-14.png",
      text: "2 files are attached"
    },
    dateTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    paName: "Wilson Kumar",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    title: "No classes will be held on 21st Nov",
    course: "Mathematics 101",
    attachment: {
      fileIcon: "/Day-6/Assets/images/icons8-attach-14.png",
      text: "2 files are attached"
    },
    dateTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    paName: "Wilson Kumar",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    title: "No classes will be held on 21st Nov",
    course: "Mathematics 101",
    attachment: {
      fileIcon: "/Day-6/Assets/images/icons8-attach-14.png",
      text: "2 files are attached"
    },
    dateTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    paName: "Wilson Kumar",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    title: "No classes will be held on 21st Nov",
    course: "Mathematics 101",
    attachment: {
      fileIcon: "/Day-6/Assets/images/icons8-attach-14.png",
      text: "2 files are attached"
    },
    dateTime: "15-Sep-2018 at 07:21 pm"
  },
  {
    paName: "Wilson Kumar",
    icon: "/Day-6/Assets/icons/radio-button-off.svg",
    title: "No classes will be held on 21st Nov No classes will be held on 21st Nov No classes will be held on 21st Nov",
    course: "Mathematics 101",
    attachment: {
      fileIcon: "/Day-6/Assets/images/icons8-attach-14.png",
      text: "2 files are attached"
    },
    dateTime: "15-Sep-2018 at 07:21 pm"
  }
];

const ancMarkup = `${announcements.map((anc) => {
  return `<div class="ancMain">
    <div class="nameImage">
      <div class="name">
        <label for="name">PA:</label>
        <p>${anc.paName}</p>
      </div>
      <div class="image">
        <img src="${anc.icon}" alt="checkanc">
      </div>
    </div>
    <div class="ancTitle title">
      <p>${anc.title}</p>
    </div>
    <div class="course ancCourse">
      <p>Course: ${anc.course}</p>
    </div>
    <div class="ancFooter">
      <div class="attachTime">
        <div class="fileAtch">
          <img src="${anc.attachment.fileIcon}" alt="attachment">
          ${anc.attachment.text}
        </div>
      </div>
      <div class="ancDateTime">
        ${anc.dateTime}
      </div>
    </div>
  </div>`;
}).join("")}`;

document.querySelector(".allAnc").innerHTML = ancMarkup;
