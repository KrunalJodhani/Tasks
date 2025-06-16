// Navigation functions
function selectActiveNav() {
    var activeNav = document.querySelectorAll(".navLink");
    activeNav.forEach(function (link) {
        link.addEventListener("click", function (e) {
            activeNav.forEach(function (l1) {
                l1.classList.remove("active");
            });
            this.classList.add("active");
        });
    });
}
document.addEventListener("DOMContentLoaded", selectActiveNav);
function selectActiveToggle() {
    var activeNav = document.querySelectorAll(".tog");
    activeNav.forEach(function (link) {
        link.addEventListener("click", function (e) {
            activeNav.forEach(function (l1) {
                l1.classList.remove("activeTog");
            });
            this.classList.add("activeTog");
        });
    });
}
document.addEventListener("DOMContentLoaded", selectActiveToggle);
// Cards data
var cards = [
    {
        title: "Acceleration",
        subject: "Physics",
        grade: "Grade 7",
        tag: "+2",
        units: 4,
        lessons: 18,
        topics: 24,
        classOptions: [
            "Mr. Frank's Class B",
            "Mr. Frank's Class A",
            "Mr. Frank's Class C"
        ],
        students: 50,
        dateRange: "21-Aug-2020 - 21-Aug-2020",
        image: "../Assets/images/imageMask-1.svg",
        icons: {
            preview: "../Assets/icons/preview.svg",
            manageCourse: "../Assets/icons/manage course.svg",
            gradeSubmissions: "../Assets/icons/grade submissions.svg",
            reports: "../Assets/icons/reports.svg"
        },
        favouriteIcon: "../Assets/icons/favourite.svg",
        expired: false
    },
    {
        title: "Displacement, Velocity and Speed",
        subject: "Physics 2",
        grade: "Grade 6",
        tag: "+3",
        units: 2,
        lessons: 15,
        topics: 20,
        classOptions: [
            "No Classes",
            "Mr. Frank's Class A",
            "Mr. Frank's Class C"
        ],
        students: null,
        dateRange: null,
        image: "../Assets/images/imageMask-2.svg",
        icons: {
            preview: "../Assets/icons/preview.svg",
            manageCourse: "../Assets/icons/manage course2.svg",
            gradeSubmissions: "../Assets/icons/grade submissions2.svg",
            reports: "../Assets/icons/reports.svg"
        },
        favouriteIcon: "../Assets/icons/favourite.svg",
        expired: false
    },
    {
        title: "Introduction to Biology: Micro organisms and how they affect the other Life Systems in En...",
        subject: "Biology",
        grade: "Grade 4",
        tag: "+1",
        units: 5,
        lessons: 16,
        topics: 24,
        classOptions: [
            "All Classes",
            "Mr. Frank's Class A",
            "Mr. Frank's Class C"
        ],
        students: 300,
        dateRange: null,
        image: "../Assets/images/imageMask.svg",
        icons: {
            preview: "../Assets/icons/preview.svg",
            manageCourse: "../Assets/icons/manage course2.svg",
            gradeSubmissions: "../Assets/icons/grade submissions2.svg",
            reports: "../Assets/icons/reports.svg"
        },
        favouriteIcon: "../Assets/icons/favourite.svg",
        expired: false
    },
    {
        title: "Introduction to High School Mathematics",
        subject: "Mathematics",
        grade: "Grade 8",
        tag: "+3",
        units: null,
        lessons: null,
        topics: null,
        classOptions: [
            "Mr. Frank's Class B",
            "Mr. Frank's Class A",
            "Mr. Frank's Class C"
        ],
        students: 44,
        dateRange: "14-Oct-2019 - 20-Oct-2019",
        image: "../Assets/images/imageMask-3.svg",
        icons: {
            preview: "../Assets/icons/preview.svg",
            manageCourse: "../Assets/icons/manage course.svg",
            gradeSubmissions: "../Assets/icons/grade submissions.svg",
            reports: "../Assets/icons/reports.svg"
        },
        favouriteIcon: "../Assets/icons/favourite2.svg",
        expired: true
    }
];
// Generate cards markup
var markup = "".concat(cards.map(function (card) {
    var optionsMarkup = card.classOptions && card.classOptions.length > 0
        ? card.classOptions
            .map(function (cls) {
            return "<option value=\"".concat(cls, "\" ").concat(cls === card.selectedClass ? "selected" : "", ">").concat(cls, "</option>");
        })
            .join("")
        : "<option value=\"\" disabled selected>No classes</option>";
    var selectMarkup = !card.selectedClass && card.classOptions && card.classOptions.length > 0
        ? "<option value=\"\" disabled selected>No classes</option>" + optionsMarkup
        : optionsMarkup;
    return "<div class=\"card\">\n    <div class=\"cardContent\">\n      <div class=\"cardImage\">\n        <img src=\"".concat(card.image, "\" alt=\"card Image\">\n      </div>\n      <div class=\"cardText\">\n        <div class=\"card_title\">\n          ").concat(card.title, "\n          <img src=\"").concat(card.favouriteIcon, "\" alt=\"favourite\" />\n        </div>\n        <div class=\"card_text\">\n        ").concat(card.subject, "\n          <div class=\"devider\"></div>\n          ").concat(card.grade, "\n          <span class=\"card_text_green\">").concat(card.tag ? "".concat(card.tag) : "", "</span>\n        </div>\n        <div class=\"card_text\">\n          <span><b style=\"color: black\">").concat(card.units ? "".concat(card.units) : "", "</b>").concat(card.units ? " Units" : "", "</span>\n          <span><b style=\"color: black\">").concat(card.lessons ? "".concat(card.lessons) : "", "</b>").concat(card.lessons ? "  Lessons" : "", "</span>\n          <span><b style=\"color: black\">").concat(card.topics ? "".concat(card.topics) : "", "</b>").concat(card.topics ? "  Topics" : "", "</span>\n        </div>\n        <div class=\"card_select_div\">\n        <select class=\"card_select\" name=\"classes\" id=\"classes\">\n        ").concat(selectMarkup, "\n      </select>\n        </div>\n        <div class=\"card_text\">\n          ").concat(card.students ? "".concat(card.students, " Students") : "", "\n          ").concat(card.students && card.dateRange ? "<span class=\"devider\"></span>" : "", "  \n          ").concat(card.dateRange ? "".concat(card.dateRange) : "", "\n        </div>\n      </div>\n    </div>\n    <div class=\"cardIcons\">\n      <div class=\"preview\">\n        <img src=\"").concat(card.icons.preview, "\" alt=\"preview icon\">\n      </div>\n      <div class=\"mngCourse\">\n        <img src=\"").concat(card.icons.manageCourse, "\" alt=\"manage course icon\">\n      </div>\n      <div class=\"grdSubmission\">\n        <img src=\"").concat(card.icons.gradeSubmissions, "\" alt=\"grade submissions icon\">\n      </div>\n      <div class=\"reports\">\n        <img src=\"").concat(card.icons.reports, "\" alt=\"reports icon\">\n      </div>\n          ").concat(card.expired ? "<div class=\"expired\">\n          EXPIRED\n        </div>" : '', "\n    </div>\n    </div>");
}).join(""));
var imageContentElement = document.getElementById("imageContent");
if (imageContentElement) {
    imageContentElement.innerHTML = markup;
}
// Alert functionality
var alertIconTop = document.getElementById("alertTop");
var alertDiv = document.getElementById("alertHover");
var alertIcon = document.getElementById("alertIcon");
var alertDelay;
function showAlert() {
    clearTimeout(alertDelay);
    console.log("display");
    if (ancDiv)
        ancDiv.style.display = "none";
    if (alertDiv)
        alertDiv.style.display = "flex";
    if (alertIconTop)
        alertIconTop.style.display = "none";
    if (alertIcon)
        alertIcon.src = "../Assets/icons/alerts2.svg";
}
if (alertIcon && alertDiv) {
    alertIcon.addEventListener("mouseenter", showAlert);
    alertDiv.addEventListener("mouseenter", showAlert);
}
function hideAlert() {
    alertDelay = setTimeout(function () {
        if (alertIconTop)
            alertIconTop.style.display = "flex";
        if (alertIcon)
            alertIcon.src = "../Assets/icons/alerts.svg";
        if (alertDiv)
            alertDiv.style.display = "none";
    }, 200);
}
if (alertIcon && alertDiv) {
    alertIcon.addEventListener("mouseleave", hideAlert);
    alertDiv.addEventListener("mouseleave", hideAlert);
}
// Announcement functionality
var ancTop = document.getElementById("announcementTop");
var ancDiv = document.getElementById("aanouncementHover");
var ancIcon = document.getElementById("ancIcon");
var ancDelay;
function showAnc() {
    clearTimeout(ancDelay);
    if (alertDiv)
        alertDiv.style.display = "none";
    if (ancDiv)
        ancDiv.style.display = "flex";
    if (ancTop)
        ancTop.style.display = "none";
    if (ancIcon)
        ancIcon.src = "../Assets/icons/announcements2.svg";
}
if (ancIcon && ancDiv) {
    ancIcon.addEventListener("mouseenter", showAnc);
    ancDiv.addEventListener("mouseenter", showAnc);
}
function hideAnc() {
    ancDelay = setTimeout(function () {
        if (ancDiv)
            ancDiv.style.display = "none";
        if (ancTop)
            ancTop.style.display = "flex";
        if (ancIcon)
            ancIcon.src = "../Assets/icons/announcements.svg";
    }, 200);
}
if (ancIcon && ancDiv) {
    ancIcon.addEventListener("mouseleave", hideAnc);
    ancDiv.addEventListener("mouseleave", hideAnc);
}
// Mobile navbar functionality
var button = document.getElementById("navbarToggle");
var div = document.getElementById("navbarMob");
var hideTimeout;
function showMenu() {
    if (hideTimeout !== null) {
        clearTimeout(hideTimeout);
    }
    if (div) {
        div.style.display = "block";
        div.style.opacity = "0";
        div.offsetHeight; // Force reflow
        div.style.opacity = "1";
    }
}
function hideMenu() {
    hideTimeout = setTimeout(function () {
        if (div)
            div.style.display = "none";
    }, 300);
}
if (button && div) {
    button.addEventListener("mouseenter", showMenu);
    button.addEventListener("mouseleave", hideMenu);
    div.addEventListener("mouseenter", showMenu);
    div.addEventListener("mouseleave", hideMenu);
}
// Navbar dropdown functionality
var navbarLinkHeads = document.querySelectorAll('.navbar_link_head');
navbarLinkHeads.forEach(function (linkHead) {
    linkHead.addEventListener('click', function (e) {
        var target = e.target;
        var clickedOnArrow = target.tagName === 'IMG';
        var clickedOnLink = target.tagName === 'A';
        if (clickedOnLink && !clickedOnArrow) {
            return;
        }
        e.preventDefault();
        var currentNavbarLink = linkHead.closest('.navbar_link');
        var currentBody = currentNavbarLink === null || currentNavbarLink === void 0 ? void 0 : currentNavbarLink.querySelector('.navbar_link_body');
        if (!currentBody) {
            return;
        }
        var allNavbarLinks = document.querySelectorAll('.navbar_link');
        allNavbarLinks.forEach(function (navbarLink) {
            var body = navbarLink.querySelector('.navbar_link_body');
            var arrow = navbarLink.querySelector('img[alt="arrow"]');
            if (body && navbarLink !== currentNavbarLink) {
                body.style.display = 'none';
                navbarLink.style.backgroundColor = 'white';
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
        var currentArrow = currentNavbarLink === null || currentNavbarLink === void 0 ? void 0 : currentNavbarLink.querySelector('img[alt="arrow"]');
        if (currentBody.style.display === 'flex') {
            currentBody.style.display = 'none';
            if (currentArrow) {
                currentArrow.style.transform = 'rotate(0deg)';
            }
            currentNavbarLink.style.backgroundColor = 'white';
        }
        else {
            currentBody.style.display = 'flex';
            if (currentArrow) {
                currentArrow.style.transform = 'rotate(180deg)';
            }
            currentNavbarLink.style.backgroundColor = '#EEEEEE';
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    var allBodies = document.querySelectorAll('.navbar_link_body');
    allBodies.forEach(function (body) {
        body.style.display = 'none';
    });
});
// Alerts data
var alerts = [
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
// Generate alerts markup
var alertMarkup = "".concat(alerts.map(function (alert) {
    return "<div class=\"alertMain\">\n    <div class=\"titleImage\">\n      <div class=\"title\">\n        <p>".concat(alert.title, "</p>\n      </div>\n      <div class=\"image\">\n        <img src=\"").concat(alert.icon, "\" alt=\"checknotification\">\n      </div>\n    </div>\n    ").concat(alert.course ? "<div class=\"courseDetails\">\n      <div class=\"courseId\">".concat(alert.course.type, ":</div>\n      <div class=\"courseName\">").concat(alert.course.name, "</div>\n    </div>") : '', "\n    <div class=\"dateTime\">\n      ").concat(alert.dateTime, "\n    </div>\n  </div>");
}).join(""));
var alertContainer = document.querySelector(".allAlert");
if (alertContainer) {
    alertContainer.innerHTML = alertMarkup;
}
// Announcements data
var announcements = [
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
// Generate announcements markup
var ancMarkup = "".concat(announcements.map(function (anc) {
    return "<div class=\"ancMain\">\n    <div class=\"nameImage\">\n      <div class=\"name\">\n        <label for=\"name\">PA:</label>\n        <p>".concat(anc.paName, "</p>\n      </div>\n      <div class=\"image\">\n        <img src=\"").concat(anc.icon, "\" alt=\"checkanc\">\n      </div>\n    </div>\n    <div class=\"ancTitle title\">\n      <p>").concat(anc.title, "</p>\n    </div>\n    <div class=\"course ancCourse\">\n      <p>Course: ").concat(anc.course, "</p>\n    </div>\n    <div class=\"ancFooter\">\n      <div class=\"attachTime\">\n        <div class=\"fileAtch\">\n          <img src=\"").concat(anc.attachment.fileIcon, "\" alt=\"attachment\">\n          ").concat(anc.attachment.text, "\n        </div>\n      </div>\n      <div class=\"ancDateTime\">\n        ").concat(anc.dateTime, "\n      </div>\n    </div>\n  </div>");
}).join(""));
var ancContainer = document.querySelector(".allAnc");
if (ancContainer) {
    ancContainer.innerHTML = ancMarkup;
}
