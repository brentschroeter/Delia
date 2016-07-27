function deliaSyncStart(box) {
    Parse.initialize("H72MUiBnW2rosirWKuZwl7wElVLD0i01k7filTlV",
            "qc3NUvGPN94OLk3NMD7sVM8aPhHY0rBnG6NGwTRU");

    var logoutButton = $("<button>Log out</button>")
        .addClass("delia-logout-button")
        .click(function() {
            Parse.User.logOut();
            location.reload(true);
        });
    $(document.body).append(logoutButton);
    var user = Parse.User.current();
    if (user) {
        deliaTasks = JSON.parse(user.get("tasks"));
        deliaAddChangeListener(function() {
            user.set("tasks", JSON.stringify(deliaTasks));
            user.save(null, {
                success: function(user) {},
                error: function(user, error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        });
        deliaRenderMain(box);
    } else {
        deliaRenderLogin(box);
    }
}

function deliaRenderLogin(box) {
    $(box).html("");
    $(".delia-logout-button").hide();
    var splash = $("<div></div>")
        .addClass("delia-splash");
    var username = $("<input />")
        .attr("type", "text")
        .addClass("delia-login-field")
        .attr("placeholder", "Username");
    var password = $("<input />")
        .attr("type", "password")
        .addClass("delia-login-field")
        .attr("placeholder", "Password");
    var button = $("<button>Log in/Sign up</button>")
        .addClass("delia-login-button")
        .click(function() {
            var user = Parse.User.logIn($(username).val(), $(password).val(), {
                success: function(user) {
                    deliaTasks = JSON.parse(user.get("tasks"));
                    deliaAddChangeListener(function() {
                        user.set("tasks", JSON.stringify(deliaTasks));
                        user.save(null, {
                            success: function(user) {},
                            error: function(user, error) {
                                alert("Error: " + error.code + " " + error.message);
                            }
                        });
                    });
                    $(".delia-logout-button").show();
                    deliaRenderMain(box);
                },
                error: function(user, error) {
                    if (error.code == 101) {
                        var user = new Parse.User();
                        user.set("username", $(username).val());
                        user.set("password", $(password).val());
                        user.set("tasks", JSON.stringify({tasks: {}}));
                        user.signUp(null, {
                            success: function(user) {
                                deliaAddChangeListener(function() {
                                    user.set("tasks", JSON.stringify(deliaTasks));
                                    user.save(null, {
                                        success: function(user) {},
                                        error: function(user, error) {
                                            alert("Error: " + error.code + " " + error.message);
                                        }
                                    });
                                });
                                $(".delia-logout-button").show();
                                deliaRenderMain(box);
                            },
                            error: function(user, error) {
                                if (error.code == 202) {
                                    alert("Error: Invalid login. Username is taken.");
                                } else {
                                    alert("Error: " + error.code + " " + error.message);
                                }
                            }
                        });
                    } else {
                        alert("Error: " + error.code + " " + error.message);
                    }
                }
            });
        });
    $(box).append(splash)
        .append(username)
        .append(password)
        .append(button);
}