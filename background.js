let memoryCache = {};

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

function getDomain(tablink) {
  if (tablink) {
    let url = tablink[0].url;
    return url.split("/")[2];
  } else {
    return null;
  }
}

function isValidURL(givenURL) {
  if (givenURL) {
    return givenURL.includes(".");
  }
  return false;
}

function getDateString() {
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth()+1;
  return `${today.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

async function saveData() {
  let url = "http://localhost:3000/extension";
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(memoryCache)
  });
  memoryCache = {};
}

function saveDataOLD() {
  for (let date in memoryCache) {
    let data = {};
    data[date] = memoryCache[date];
    chrome.storage.local.set(data, function() {
      console.log("Saved data for date: " + date);
    });
  }
}

const throttledSaveData = throttle(saveData, 10000);

function updateTime() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(activeTab) {
    let domain = getDomain(activeTab);
    if (isValidURL(domain)) {
      let today = getDateString();
      if (!memoryCache[domain]) {
        memoryCache[domain] = {};
      }
      if (!memoryCache[domain][today]) {
        memoryCache[domain][today] = 0;
      }
      memoryCache[domain][today] += 5;
      throttledSaveData();
    } else {}
  })
}

// function updateTime() {
//   chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(activeTab) {
//     let domain = getDomain(activeTab);
//     if (isValidURL(domain)) {
//       let today = new Date();
//       let presentDate = getDateString(today);
//       if (!memoryCache[presentDate]) {
//         memoryCache[presentDate] = {};
//       }
//       if (!memoryCache[presentDate][domain]) {
//         memoryCache[presentDate][domain] = 0;
//       }
//       memoryCache[presentDate][domain] += 5;
//       chrome.browserAction.setBadgeText({
//         text: secondsToString(memoryCache[presentDate][domain], true),
//       });
//       throttledSaveData();
//     } else {
//       chrome.browserAction.setBadgeText({ text: "" });
//     }
//   });
// }

var intervalID;

intervalID = setInterval(updateTime, 5000);
setInterval(checkFocus, 2000);

function checkFocus() {
  chrome.windows.getCurrent(function(window) {
    if (window.focused) {
      if (!intervalID) {
        intervalID = setInterval(updateTime, 5000);
      }
    } else {
      if (intervalID) {
        clearInterval(intervalID);
        intervalID = null;
      }
    }
  });
}
