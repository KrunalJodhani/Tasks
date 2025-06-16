// Type definitions and interfaces
interface CardIcons {
  preview: string;
  manageCourse: string;
  gradeSubmissions: string;
  reports: string;
}

interface Card {
  title: string;
  subject: string;
  grade: string;
  tag: string;
  units: number | null;
  lessons: number | null; 
  topics: number | null;
  classOptions: string[];
  students: number | null;
  dateRange: string | null;
  image: string;
  icons: CardIcons;
  favouriteIcon: string;
  expired: boolean;
  selectedClass?: string;
}

interface CourseInfo {
  type: string;
  name: string;
}

interface Alert {
  title: string;
  dateTime: string;
  icon: string;
  course: CourseInfo | null;
}

interface Attachment {
  fileIcon: string;
  text: string;
}

interface Announcement {
  paName: string;
  icon: string;
  title: string;
  course: string;
  attachment: Attachment;
  dateTime: string;
}

// Type for timeout IDs
type TimeoutId = ReturnType<typeof setTimeout>;

// Navigation functions
function selectActiveNav(): void {
  const activeNav: NodeListOf<Element> = document.querySelectorAll(".navLink");
  activeNav.forEach((link: Element) => {
    link.addEventListener("click", function (this: Element, e: Event): void {
      activeNav.forEach((l1: Element) => {
        l1.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", selectActiveNav);

function selectActiveToggle(): void {
  const activeNav: NodeListOf<Element> = document.querySelectorAll(".tog");
  activeNav.forEach((link: Element) => {
    link.addEventListener("click", function (this: Element, e: Event): void {
      activeNav.forEach((l1: Element) => {
        l1.classList.remove("activeTog");
      });
      this.classList.add("activeTog");
    });
  });
}

document.addEventListener("DOMContentLoaded", selectActiveToggle);

// Cards data
const cards: Card[] = [
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
const markup: string = `${cards.map((card: Card): string => {
  const optionsMarkup: string =
    card.classOptions && card.classOptions.length > 0
      ? card.classOptions
        .map((cls: string): string =>
          `<option value="${cls}" ${cls === card.selectedClass ? "selected" : ""}>${cls}</option>`
        )
        .join("")
      : `<option value="" disabled selected>No classes</option>`;

  const selectMarkup: string =
    !card.selectedClass && card.classOptions && card.classOptions.length > 0
      ? `<option value="" disabled selected>No classes</option>` + optionsMarkup
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
    </div>`;
}).join("")}`;

const imageContentElement: HTMLElement | null = document.getElementById("imageContent");
if (imageContentElement) {
  imageContentElement.innerHTML = markup;
}

// Alert functionality
const alertIconTop: HTMLElement | null = document.getElementById("alertTop");
const alertDiv: HTMLElement | null = document.getElementById("alertHover");
const alertIcon: HTMLImageElement | null = document.getElementById("alertIcon") as HTMLImageElement;
let alertDelay: TimeoutId;

function showAlert(): void {
  clearTimeout(alertDelay);
  console.log("display");
  
  if (ancDiv) ancDiv.style.display = "none";
  if (alertDiv) alertDiv.style.display = "flex";
  if (alertIconTop) alertIconTop.style.display = "none";
  if (alertIcon) alertIcon.src = "../Assets/icons/alerts2.svg";
}

if (alertIcon && alertDiv) {
  alertIcon.addEventListener("mouseenter", showAlert);
  alertDiv.addEventListener("mouseenter", showAlert);
}

function hideAlert(): void {
  alertDelay = setTimeout((): void => {
    if (alertIconTop) alertIconTop.style.display = "flex";
    if (alertIcon) alertIcon.src = "../Assets/icons/alerts.svg";
    if (alertDiv) alertDiv.style.display = "none";
  }, 200);
}

if (alertIcon && alertDiv) {
  alertIcon.addEventListener("mouseleave", hideAlert);
  alertDiv.addEventListener("mouseleave", hideAlert);
}

// Announcement functionality
const ancTop: HTMLElement | null = document.getElementById("announcementTop");
const ancDiv: HTMLElement | null = document.getElementById("aanouncementHover");
const ancIcon: HTMLImageElement | null = document.getElementById("ancIcon") as HTMLImageElement;
let ancDelay: TimeoutId;

function showAnc(): void {
  clearTimeout(ancDelay);
  if (alertDiv) alertDiv.style.display = "none";
  if (ancDiv) ancDiv.style.display = "flex";
  if (ancTop) ancTop.style.display = "none";
  if (ancIcon) ancIcon.src = "../Assets/icons/announcements2.svg";
}

if (ancIcon && ancDiv) {
  ancIcon.addEventListener("mouseenter", showAnc);
  ancDiv.addEventListener("mouseenter", showAnc);
}

function hideAnc(): void {
  ancDelay = setTimeout((): void => {
    if (ancDiv) ancDiv.style.display = "none";
    if (ancTop) ancTop.style.display = "flex";
    if (ancIcon) ancIcon.src = "../Assets/icons/announcements.svg";
  }, 200);
}

if (ancIcon && ancDiv) {
  ancIcon.addEventListener("mouseleave", hideAnc);
  ancDiv.addEventListener("mouseleave", hideAnc);
}

// Mobile navbar functionality
const button: HTMLElement | null = document.getElementById("navbarToggle");
const div: HTMLElement | null = document.getElementById("navbarMob");

let hideTimeout: TimeoutId;

function showMenu(): void {
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

function hideMenu(): void {
  hideTimeout = setTimeout((): void => {
    if (div) div.style.display = "none";
  }, 300);
}

if (button && div) {
  button.addEventListener("mouseenter", showMenu);
  button.addEventListener("mouseleave", hideMenu);
  div.addEventListener("mouseenter", showMenu);
  div.addEventListener("mouseleave", hideMenu);
}

// Navbar dropdown functionality
const navbarLinkHeads: NodeListOf<Element> = document.querySelectorAll('.navbar_link_head');

navbarLinkHeads.forEach((linkHead: Element): void => {
  linkHead.addEventListener('click', (e: Event): void => {
    const target = e.target as HTMLElement;
    const clickedOnArrow: boolean = target.tagName === 'IMG';
    const clickedOnLink: boolean = target.tagName === 'A';

    if (clickedOnLink && !clickedOnArrow) {
      return;
    }

    e.preventDefault();

    const currentNavbarLink: HTMLElement | null = linkHead.closest('.navbar_link') as HTMLElement;
    const currentBody: HTMLElement | null = currentNavbarLink?.querySelector('.navbar_link_body') as HTMLElement;

    if (!currentBody) {
      return;
    }

    const allNavbarLinks: NodeListOf<Element> = document.querySelectorAll('.navbar_link');
    allNavbarLinks.forEach((navbarLink: Element): void => {
      const body: HTMLElement | null = navbarLink.querySelector('.navbar_link_body') as HTMLElement;
      const arrow: HTMLImageElement | null = navbarLink.querySelector('img[alt="arrow"]') as HTMLImageElement;

      if (body && navbarLink !== currentNavbarLink) {
        body.style.display = 'none';
        (navbarLink as HTMLElement).style.backgroundColor = 'white';
        if (arrow) {
          arrow.style.transform = 'rotate(0deg)';
        }
      }
    });

    const currentArrow: HTMLImageElement | null = currentNavbarLink?.querySelector('img[alt="arrow"]') as HTMLImageElement;

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

document.addEventListener('DOMContentLoaded', (): void => {
  const allBodies: NodeListOf<Element> = document.querySelectorAll('.navbar_link_body');
  allBodies.forEach((body: Element): void => {
    (body as HTMLElement).style.display = 'none';
  });
});

// Alerts data
const alerts: Alert[] = [
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
const alertMarkup: string = `${alerts.map((alert: Alert): string => {
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

const alertContainer: HTMLElement | null = document.querySelector(".allAlert");
if (alertContainer) {
  alertContainer.innerHTML = alertMarkup;
}

// Announcements data
const announcements: Announcement[] = [
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
const ancMarkup: string = `${announcements.map((anc: Announcement): string => {
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

const ancContainer: HTMLElement | null = document.querySelector(".allAnc");
if (ancContainer) {
  ancContainer.innerHTML = ancMarkup;
}