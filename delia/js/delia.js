var deliaTasks = (window.deliaTasks === undefined) ? {"tasks": {}} : window.deliaTasks;
var deliaOpenTask = null;
var deliaMouseData = {creating: false};
var deliaIcons = ["pencil", "wrench", "subway", "male", "female", "phone", "home", "camera", "book",
        "car", "money", "users", "envelope-o"];
var deliaChangeListeners = [];

function deliaAddChangeListener(f) {
    deliaChangeListeners.push(f);
}

function deliaNewId() {
    var taskIds = Object.keys(deliaTasks.tasks);
    if (taskIds.length == 0) {
        return 0;
    }
    return Math.max.apply(null, taskIds) + 1;
}

function deliaCallChangeListeners() {
    for (var i = 0; i < deliaChangeListeners.length; ++i) {
        deliaChangeListeners[i]();
    }
}

function deliaRenderTask(box, taskId) {
    $("#delia-task-" + taskId).remove();
    var taskLayer = $(box).find(".delia-task-layer");
    var task = document.createElement("div");
    $(task).addClass("delia-task")
        .html("<span class=\"fa fa-" + deliaTasks.tasks[taskId].icon + "\"></span>")
        .attr("id", "delia-task-" + taskId)
        .draggable({
            axis: (deliaTasks.tasks[taskId].due == null) ? false : "y",
            stop: function(ev, ui) {
                deliaTasks.tasks[taskId].importance = 100.0 *
                        (1.0 - (ev.pageY - $(taskLayer).offset().top) / $(taskLayer).height());
                if (deliaTasks.tasks[taskId].due == null) {
                    deliaTasks.tasks[taskId].xPosition = 100.0 *
                        (ev.pageX - $(taskLayer).offset().left) / $(taskLayer).width();
                }
                deliaCallChangeListeners();
            }
        })
        .click(function() {
            deliaOpenTask = taskId;
            deliaRenderDetail(box);
        })
        .mousedown(function(ev) {
            ev.stopPropagation();
        })
        .css({
            position: "absolute",
            left: (deliaTasks.tasks[taskId].xPosition) + "%",
            top: (100.0 - deliaTasks.tasks[taskId].importance) + "%"
        });
    $(taskLayer).append(task);
}

function deliaRenderMain(box) {
    $(box).html("");
    var bg = document.createElement("div");
    $(bg).css({position: "absolute", left: 0, top: 0, width: "100%", height: "100%"});
    var classes = ["delia-red", "delia-green", "delia-gray"];
    var yLabelFiles = ["img/critical.svg", "img/useful.svg", "img/meh.svg"];
    var xLabelFiles = ["img/month.svg", "img/week.svg", "img/day.svg"];
    for (var i = 0; i < classes.length; ++i) {
        for (var j = 0; j < 3; ++j) {
            var rect = document.createElement("div");
            $(rect).addClass(classes[i])
                .css({
                    position: "absolute",
                    left: (j * 33.333) + "%",
                    top: (i * 33.333) + "%",
                    width: "33.333%",
                    height: "33.333%",
                    opacity: 0.5 + j * 0.25
                });
            if (j == 0) {
                if (i == classes.length - 1) {
                    $(rect).css("background-image", "url(" + yLabelFiles[i] + ")" +
                            ", url(" + xLabelFiles[j] + ")")
                        .css({
                            backgroundPosition: "left, bottom",
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "40px, 20px"
                        });
                } else {
                    $(rect).css("background-image", "url(" + yLabelFiles[i] + ")")
                        .css({
                            backgroundPosition: "left",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "40px"
                        });
                }
            } else if (i == classes.length - 1) {
                $(rect).css("background-image", "url(" + xLabelFiles[j] + ")")
                    .css({
                        backgroundPosition: "bottom",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "20px"
                    });
            }
            $(bg).append(rect);
        }
    }
    $(box).append(bg);
    var taskLayer = document.createElement("div");
    $(taskLayer).addClass("delia-task-layer")
        .mousedown(function(ev) {
            deliaMouseData.creating = true;
        })
        .mouseup(function(ev) {
            if (deliaMouseData.creating) {
                var taskId = deliaNewId()
                deliaTasks.tasks[taskId] = {
                    "name": "Untitled task",
                    "icon": deliaIcons[0],
                    "importance": 100.0 *
                            (1.0 - (ev.pageY - $(taskLayer).offset().top) / $(taskLayer).height()),
                    "xPosition": 100.0 * (ev.pageX - $(taskLayer).offset().left) / $(taskLayer).width(),
                    "due": null
                };
                deliaOpenTask = taskId;
                deliaRenderDetail(box);
            }
            deliaMouseData.creating = false;
        });
    $(box).append(taskLayer);
    var taskIds = Object.keys(deliaTasks.tasks);
    for (var i = 0; i < taskIds.length; ++i) {
        deliaRenderTask(box, taskIds[i]);
    }
}

function deliaRenderDetail(box) {
    $(box).html("");
    var header = document.createElement("div");
    $(header).addClass("delia-header");
    var icon = document.createElement("div");
    $(icon).addClass("delia-icon")
        .html("<span class=\"fa fa-" + deliaTasks.tasks[deliaOpenTask].icon + "\"></span>")
        .click(function() {
            deliaRenderIconSelector(box);
        });
    var title = document.createElement("input");
    $(title).attr("type", "text")
        .addClass("delia-title")
        .val(deliaTasks.tasks[deliaOpenTask].name)
        .keyup(function() {
            deliaTasks.tasks[deliaOpenTask].name = $(this).val();
        });
    $(header).append(icon)
        .append(title);
    var footer = document.createElement("div");
    $(footer).addClass("delia-footer");
    var save = document.createElement("div");
    $(save).addClass("delia-save")
        .html("<span class=\"fa fa-floppy-o\"></span>")
        .click(function() {
            deliaCallChangeListeners();
            deliaRenderMain(box);
        });
    var finish = document.createElement("div");
    $(finish).addClass("delia-finish")
        .html("<span class=\"fa fa-flag-checkered\"></span>")
        .click(function() {
            delete deliaTasks.tasks[deliaOpenTask];
            deliaCallChangeListeners();
            deliaRenderMain(box);
        });
    $(footer).append(save)
        .append(finish);
    $(box).append(header)
        .append(footer);
}

function deliaRenderIconSelector(box) {
    $(box).html("");
    var iconSelector = document.createElement("div");
    var rowLen = 5;
    $(iconSelector).addClass("delia-icon-selector");
    for (var i = 0; i < deliaIcons.length; ++i) {
        var icon = document.createElement("div");
        $(icon).addClass("delia-icon")
            .html("<span class=\"fa fa-" + deliaIcons[i] + "\"></span>")
            .data("icon-name", deliaIcons[i])
            .click(function() {
                deliaTasks.tasks[deliaOpenTask].icon = $(this).data("icon-name");
                deliaRenderDetail(box);
            });
        if (deliaIcons[i] == deliaTasks.tasks[deliaOpenTask].icon) {
            $(icon).addClass("selected");
        }
        $(iconSelector).append(icon);
        if (i % rowLen == rowLen - 1) {
            $(iconSelector).append("<br />");
        }
    }
    $(box).append(iconSelector);
}