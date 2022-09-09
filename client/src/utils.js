// copied from here
// https://muffinman.io/blog/javascript-time-ago-function/

function capitalize(text) {
  var ret = text ? text[0].toUpperCase() + text.substring(1) : text;
  while (ret.includes("_")) ret = ret.replace("_", " ");
  return ret;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = date.getMinutes();

  if (minutes < 10) {
    // Adding leading zero to minutes
    minutes = `0${minutes}`;
  }

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${prefomattedDate} at ${hours}:${minutes}`;
  }

  if (hideYear) {
    // 10. January at 10:20
    return `${month} ${day}`;
  }

  return `${month} ${day} ${year}`;
}

function timeAgo(dateParam) {
  if (!dateParam) {
    return null;
  }

  const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = new Date();
  const yesterday = new Date(today - DAY_IN_MS);
  const seconds = Math.round((today - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();

  if (seconds < 5) {
    return "now";
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 90) {
    return "about a minute ago";
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    if (hours == 1) return `an hour ago`;
    else return `${hours} hours ago`;
  } else if (isToday) {
    return getFormattedDate(date, "today"); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, "yesterday"); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, false, true); // 10. January at 10:20
  }

  return getFormattedDate(date); // 10. January 2017. at 10:20
}

const dormData = new Map(
  Object.entries({
    baker: {
      name: "Baker House",
      ranges: [[700, 721]], // 22
    },
    mccormick: {
      name: "McCormick",
      ranges: [[778, 796]], // 19
    },
    simmons: {
      name: "Simmons Hall",
      ranges: [[797, 816]], // 20
    },
    next: {
      name: "Next House",
      ranges: [[829, 850]], // 22
    },
    new: {
      name: "New House",
      ranges: [[851, 870]], // 20
    },
    maseeh: {
      name: "Maseeh Hall",
      ranges: [[871, 904]], // 34
    },
    ec: {
      name: "East Campus",
      ranges: [
        [1039, 1062],
        // [1128, 1131],
      ], // 24
    },
    macg: {
      name: "MacGregor House",
      ranges: [[1075, 1106]], // 32
    },
    // bc: {
    //   name: "Burton Conner",
    //   ranges: [[1107, 1127]], // 21
    // },
    nv: {
      name: "New Vassar",
      ranges: [[1132, 1171]], // 40
    },
    site4: {
      name: "Site 4",
      ranges: [[1172, 1235]], // 64
    },
  })
);

function getFullDormName(id) {
  for (const [name, data] of dormData) {
    if (name === id) return data.name;
  }
  return undefined;
}

function getLocations() {
  return [...dormData.keys()];
}

export default {
  timeAgo,
  capitalize,
  getFullDormName,
  getLocations,
};
