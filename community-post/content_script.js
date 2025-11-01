let button = document.createElement("button");
button.innerHTML = "Save comments";
button.style.position = "fixed";
button.style.bottom = "0";
button.style.right = "0";
button.style.zIndex = "100000";
button.id = "myButton";
button.onclick = function () {
  const commentsArray = [];
  const questions = document.querySelectorAll("[id='content-text']");
  for (let i = 0; i < questions.length; i++) {
    commentsArray.push(questions[i].innerText);
  }

  const voteCounts = Array.from(
    document.querySelectorAll("[id='vote-count-middle']")
  );
  const voteCountArray = voteCounts.map((voteCount) => voteCount.innerText);

  const authorNames = Array.from(
    document.querySelectorAll("[id='author-text']")
  );
  const authorNameArray = authorNames.map((authorName) => authorName.innerText);

  const authorLinks = Array.from(
    document.querySelectorAll("[id='author-text']")
  );
  const authorLinkArray = authorLinks.map((authorLink) => authorLink.href);

  const authorImages = Array.from(document.querySelectorAll("[id='img']"));
  const authorImageArray = authorImages.map((authorImage) => authorImage.src);

  const comments = [];
  for (let i = 0; i < commentsArray.length; i++) {
    comments.push({
      comment: commentsArray[i],
      votes: voteCountArray[i],
      author: authorNameArray[i],
      authorLink: authorLinkArray[i],
      authorImage: authorImageArray[i],
    });
  }
  console.log("comments", comments);
  // Convert the data to a CSV string
  var csv = convertArrayOfObjectsToCSV(comments);

  // Download the CSV file
  downloadCSV(csv);
};
document.body.appendChild(button);

// Convert array of objects to CSV
function convertArrayOfObjectsToCSV(data) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = ",";
  lineDelimiter = "\n";

  keys = Object.keys(data[0]);

  result = "";
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function (item) {
    ctr = 0;
    keys.forEach(function (key) {
      if (ctr > 0) result += columnDelimiter;
      const txt = item[key].replaceAll('"', '""');
      result += `"${txt}"`;
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

// Download CSV file
function downloadCSV(csv) {
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  var url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "comments.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
