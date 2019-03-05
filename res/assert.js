window.onerror = function (error) {
    assert(false, error.toString());
};

function assert(condition, message) {
    var line = document.createElement("div"),
        status = line.appendChild(document.createElement("span")),
        color;
    if (typeof condition === "function") {
        message = condition.toString().match(/(?:=>|{)([^}]*)\}?/)[1].toString();
        try {
            condition = condition();
        } catch (e) {
            condition = false;
        }
    }
    line.appendChild(document.createTextNode(message));
    if (condition) {
        status.innerHTML = "&check;";
        color = "green";
    } else {
        status.innerHTML = "&cross;";
        color = "red";
    }
    status.setAttribute("style", "width: 1rem; color: " + color + ";");
    return document.body.appendChild(line);
}
